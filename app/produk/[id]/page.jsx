import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import AsistenProduk from "@/components/AsistenProduk";
import GaleriProduk from "@/components/GaleriProduk";
import KartuProduk from "@/components/KartuProduk";
import PelacakProdukDilihat from "@/components/PelacakProdukDilihat";
import PilihVarian from "@/components/PilihVarian";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import TombolBagikan from "@/components/TombolBagikan";
import TombolBandingkan from "@/components/TombolBandingkan";
import TombolFavorit from "@/components/TombolFavorit";
import TombolKeranjang from "@/components/TombolKeranjang";
import UlasanProduk from "@/components/UlasanProduk";
import { formatRupiah } from "@/lib/format";
import { ambilPengaturanToko } from "@/lib/pengaturan-toko";
import { ambilProdukPublik, hargaProduk, produkHabis } from "@/lib/produk";
import { supabasePublik } from "@/lib/supabase/server";
import { ambilVarianAktif } from "@/lib/varian";

const ambilProduk = cache(ambilProdukPublik);

async function ambilProdukTerkait(produk) {
  if (!produk.kategori) return [];
  const { data, error } = await supabasePublik()
    .from("produk")
    .select("id, nama, harga, harga_diskon, foto_url, kategori, stok, badge, aktif, urutan")
    .eq("kategori", produk.kategori)
    .eq("aktif", true)
    .neq("id", produk.id)
    .order("urutan", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(4);
  return error ? [] : data;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { produk } = await ambilProduk(id);
  if (!produk) return { title: "Produk tidak ditemukan" };
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

export default async function HalamanDetailProduk({ params, searchParams }) {
  const { id } = await params;
  const { ulasan: statusUlasan } = await searchParams;
  const { produk, foto } = await ambilProduk(id);
  if (!produk) notFound();

  const [produkTerkait, varian, pengaturan] = await Promise.all([
    ambilProdukTerkait(produk),
    ambilVarianAktif(supabasePublik(), produk.id),
    ambilPengaturanToko(),
  ]);
  const hargaAktif = hargaProduk(produk);
  const produkPilihan = { ...produk, harga: hargaAktif };
  const habis = produkHabis(produk) && varian.every((item) => item.stok <= 0);

  return (
    <>
      <PelacakProdukDilihat produk={produkPilihan} />
      <article className="grid gap-8 py-8 md:grid-cols-2 md:py-12">
        <GaleriProduk foto={foto} nama={produk.nama} />
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
            Kembali ke katalog
          </Link>
          {produk.kategori && (
            <Link href={`/kategori/${encodeURIComponent(produk.kategori)}`} className="self-start text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
              {produk.kategori}
            </Link>
          )}
          {produk.badge && <span className="self-start rounded-full bg-utama px-3 py-1 text-xs font-bold text-white">{produk.badge}</span>}
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{produk.nama}</h1>
          {produk.harga_diskon != null && <s className="text-teks-lembut">{formatRupiah(produk.harga)}</s>}
          <p className="max-w-prose leading-relaxed text-teks-lembut">{produk.deskripsi}</p>
          {habis ? (
            <p className="self-start rounded-lg bg-permukaan px-4 py-3 font-bold text-bahaya">Habis</p>
          ) : (
            <>
              {varian && varian.length > 0 ? (
                <PilihVarian produk={produkPilihan} daftarVarian={varian} stok={produk.stok} nomorWhatsApp={pengaturan.nomorWhatsApp} />
              ) : null}
              <TombolWhatsApp produk={produkPilihan} />
            </>
          )}
          <div className="flex flex-wrap items-start gap-3">
            {!habis && <TombolKeranjang produk={produkPilihan} />}
            <TombolBandingkan produk={produkPilihan} />
            <TombolFavorit produk={produkPilihan} />
            <TombolBagikan nama={produk.nama} />
          </div>
        </div>
      </article>
      <AsistenProduk produkId={produk.id} />
      <UlasanProduk produkId={produk.id} status={statusUlasan} />
      {produkTerkait.length > 0 && (
        <section aria-labelledby="judul-produk-terkait" className="flex flex-col gap-5 pb-10">
          <h2 id="judul-produk-terkait" className="text-xl font-bold">Produk terkait</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {produkTerkait.map((item) => <KartuProduk key={item.id} produk={item} />)}
          </div>
        </section>
      )}
    </>
  );
}
