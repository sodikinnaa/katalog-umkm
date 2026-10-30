import Link from "next/link";
import { notFound } from "next/navigation";
import { PilihanBandingkan, TombolHapusBandingkan } from "@/components/PengelolaPilihanProduk";
import { formatRupiah } from "@/lib/format";
import { supabasePublik } from "@/lib/supabase/server";

export const metadata = { title: "Bandingkan produk" };

export default async function HalamanBandingkan({ searchParams }) {
  const params = await searchParams;
  const mentah = Array.isArray(params.id) ? params.id : params.id ? [params.id] : [];
  const ids = [...new Set(mentah.filter((id) => /^\d{1,18}$/.test(id)))].slice(0, 2);

  if (ids.length < 2) {
    return (
      <section className="flex flex-col gap-5 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Bandingkan produk</h1>
        <PilihanBandingkan />
      </section>
    );
  }

  const { data, error } = await supabasePublik()
    .from("produk")
    .select("id, nama, harga, deskripsi, foto_url, kategori")
    .in("id", ids);

  if (error || data?.length !== ids.length) notFound();

  const produk = ids.map((id) => data.find((item) => String(item.id) === id));

  return (
    <section className="flex flex-col gap-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Bandingkan produk</h1>
          <p className="mt-2 max-w-prose text-teks-lembut">Lihat detail dua produk berdampingan.</p>
        </div>
        <TombolHapusBandingkan />
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-6">
        {produk.map((item) => (
          <article key={item.id} className="flex min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border border-garis bg-latar p-3 md:p-5">
            <Link href={`/produk/${item.id}`}>
              <img src={item.foto_url} alt={item.nama} className="aspect-square w-full rounded-xl bg-permukaan object-cover" />
            </Link>
            <p className="text-xs text-teks-lembut md:text-sm">{item.kategori || "Tanpa kategori"}</p>
            <h2 className="font-bold leading-snug md:text-xl">
              <Link href={`/produk/${item.id}`} className="hover:text-utama">
                {item.nama}
              </Link>
            </h2>
            <p className="self-start rounded-md bg-harga-latar px-2 py-1 text-sm font-bold text-harga md:text-base">
              {formatRupiah(item.harga)}
            </p>
            <p className="break-words text-sm leading-relaxed text-teks-lembut md:text-base">
              {item.deskripsi || "Deskripsi belum tersedia."}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
