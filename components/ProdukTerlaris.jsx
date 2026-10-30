import Link from "next/link";
import { supabasePublik } from "@/lib/supabase/server";

export default async function ProdukTerlaris() {
  const { data, error } = await supabasePublik()
    .from("produk_terlaris")
    .select("produk_id, nama, jumlah_klik, klik_terakhir")
    .order("jumlah_klik", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Produk terlaris:", error.message);
    return <p className="rounded-2xl border border-garis bg-permukaan p-4 text-sm text-teks-lembut">Statistik klik WhatsApp belum tersedia. Jalankan migrasi 006.</p>;
  }

  return (
    <section aria-labelledby="judul-produk-terlaris" className="flex flex-col gap-3">
      <h2 id="judul-produk-terlaris" className="text-xl font-bold">Produk terlaris</h2>
      <p className="text-sm text-teks-lembut">5 produk dengan klik pesan WhatsApp terbanyak.</p>
      {data.length === 0 ? (
        <p className="rounded-2xl border border-garis bg-permukaan p-6 text-teks-lembut">Belum ada klik pesan WhatsApp yang tercatat.</p>
      ) : (
        <ol className="divide-y divide-garis overflow-hidden rounded-2xl border border-garis">
          {data.map((item, i) => (
            <li key={item.produk_id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-teks-lembut">{i + 1}.</span>
                <Link href={`/produk/${item.produk_id}`} className="font-semibold hover:text-utama">{item.nama}</Link>
              </div>
              <span className="whitespace-nowrap text-sm text-teks-lembut">{item.jumlah_klik} klik</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
