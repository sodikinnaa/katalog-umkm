import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import KartuProduk from "@/components/KartuProduk";
import PelacakProdukDilihat from "@/components/PelacakProdukDilihat";
import TombolBagikan from "@/components/TombolBagikan";
import TombolFavorit from "@/components/TombolFavorit";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import { formatRupiah } from "@/lib/format";
import { supabasePublik } from "@/lib/supabase/server";

const ambilProduk = cache(async (id) => {
  const { data, error } = await supabasePublik()
    .from("produk")
    .select("id, nama, harga, deskripsi, foto_url, kategori")
    .eq("id", id)
    .maybeSingle();
  return error ? null : data;
});

async function ambilProdukTerkait(produk) {
  if (!produk.kategori) return [];
  const { data, error } = await supabasePublik()
    .from("produk")
    .select("id, nama, harga, foto_url, kategori")
    .eq("kategori", produk.kategori)
    .neq("id", produk.id)
    .order("created_at", { ascending: false })
    .limit(4);
  return error ? [] : data;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const produk = await ambilProduk(id);
  if (!produk) {
    return { title: "Produk tidak ditemukan" };
  }
  return {
    title: produk.nama,
    description: produk.deskripsi,
    openGraph: {
      title: produk.nama,
      description: produk.deskripsi,
      images: produk.foto_url ? [produk.foto_url] : [],
    },
  };
}

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  const produk = await ambilProduk(id);

  if (!produk) {
    notFound();
  }

  const produkTerkait = await ambilProdukTerkait(produk);

  return (
    <>
      <PelacakProdukDilihat produk={produk} />
      <article className="grid gap-8 py-8 md:grid-cols-2 md:py-12">
        <img
          src={produk.foto_url}
          alt={produk.nama}
          className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover"
        />
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
            Kembali ke katalog
          </Link>
          {produk.kategori && (
            <Link
              href={`/kategori/${encodeURIComponent(produk.kategori)}`}
              className="self-start text-sm text-teks-lembut underline underline-offset-4 hover:text-utama"
            >
              {produk.kategori}
            </Link>
          )}
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{produk.nama}</h1>
          <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga">
            {formatRupiah(produk.harga)}
          </p>
          <p className="max-w-prose leading-relaxed text-teks-lembut">{produk.deskripsi}</p>
          <div className="flex flex-wrap gap-3">
            <TombolWhatsApp produk={produk} />
            <TombolFavorit produk={produk} />
            <TombolBagikan nama={produk.nama} />
          </div>
        </div>
      </article>
      {produkTerkait.length > 0 && (
        <section aria-labelledby="judul-produk-terkait" className="flex flex-col gap-5 pb-10">
          <h2 id="judul-produk-terkait" className="text-xl font-bold">
            Produk terkait
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {produkTerkait.map((item) => (
              <KartuProduk key={item.id} produk={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
