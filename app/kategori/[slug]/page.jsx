import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import KartuProduk from "@/components/KartuProduk";
import { supabasePublik } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ambilProdukKategori = cache(async (kategori) => {
  if (!kategori || kategori.length > 100) return [];
  const { data, error } = await supabasePublik()
    .from("produk")
    .select("id, nama, harga, foto_url, kategori")
    .eq("kategori", kategori)
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });
  if (error) {
    throw new Error(`Gagal mengambil produk: ${error.message}`);
  }
  return data;
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const kategori = decodeURIComponent(slug);
  const daftarProduk = await ambilProdukKategori(kategori);
  if (daftarProduk.length === 0) {
    return { title: "Kategori tidak ditemukan" };
  }
  const description = `Produk kategori ${kategori}.`;
  return {
    title: kategori,
    description,
    openGraph: { title: kategori, description },
  };
}

export default async function HalamanKategori({ params }) {
  const { slug } = await params;
  const kategori = decodeURIComponent(slug);
  const daftarProduk = await ambilProdukKategori(kategori);

  if (daftarProduk.length === 0) {
    notFound();
  }

  return (
    <section className="flex flex-col gap-5 py-10 sm:py-14">
      <Link href="/" className="self-start text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
        Kembali ke katalog
      </Link>
      <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{kategori}</h1>
      <p className="text-teks-lembut">{daftarProduk.length} produk</p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {daftarProduk.map((produk) => (
          <KartuProduk key={produk.id} produk={produk} />
        ))}
      </div>
    </section>
  );
}
