import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import KartuProduk from "@/components/KartuProduk";
import { supabasePublik } from "@/lib/supabase/server";
import { pesanMigrasi } from "@/lib/produk";

export const dynamic = "force-dynamic";

const ambilKategori = cache(async (slug) => {
  const supabase = supabasePublik();
  const nama = decodeURIComponent(slug).slice(0, 100);
  let hasilKategori = await supabase.from("kategori").select("id, nama, slug").eq("slug", slug).maybeSingle();
  if (!hasilKategori.error && !hasilKategori.data) {
    hasilKategori = await supabase.from("kategori").select("id, nama, slug").eq("nama", nama).maybeSingle();
  }
  if (hasilKategori.error || !hasilKategori.data) return { kategori: null, produk: [], error: hasilKategori.error };
  const hasilProduk = await supabase
    .from("produk")
    .select("id, nama, harga, harga_diskon, foto_url, kategori, stok, badge, aktif, urutan")
    .eq("kategori", hasilKategori.data.nama)
    .eq("aktif", true)
    .order("urutan", { ascending: true })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });
  return { kategori: hasilKategori.data, produk: hasilProduk.data || [], error: hasilProduk.error };
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { kategori } = await ambilKategori(slug);
  if (!kategori) return { title: "Kategori tidak ditemukan" };
  const description = `Produk kategori ${kategori.nama}.`;
  return { title: kategori.nama, description, openGraph: { title: kategori.nama, description } };
}

export default async function HalamanKategori({ params }) {
  const { slug } = await params;
  const hasil = await ambilKategori(slug);
  const galat = pesanMigrasi(hasil.error);
  if (galat) return <p role="alert" className="my-10 font-semibold text-bahaya">{galat}</p>;
  if (!hasil.kategori) notFound();

  return (
    <section className="flex flex-col gap-5 py-10 sm:py-14">
      <Link href="/" className="self-start text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">Kembali ke katalog</Link>
      <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{hasil.kategori.nama}</h1>
      <p className="text-teks-lembut">{hasil.produk.length} produk</p>
      {hasil.produk.length === 0 ? (
        <p className="rounded-lg border border-garis bg-permukaan p-6 text-teks-lembut">Belum ada produk aktif dalam kategori ini.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {hasil.produk.map((produk) => <KartuProduk key={produk.id} produk={produk} />)}
        </div>
      )}
    </section>
  );
}
