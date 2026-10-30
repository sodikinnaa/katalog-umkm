import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import GaleriProduk from "@/components/GaleriProduk";
import { supabaseSesi } from "@/lib/supabase/server";
import { ubahProduk } from "@/app/admin/actions";
import { daftarFotoProduk, pesanMigrasi } from "@/lib/produk";

export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;
  const supabase = await supabaseSesi();

  const [hasilProduk, hasilKategori, hasilFoto] = await Promise.all([
    supabase.from("produk").select("id, nama, harga, harga_diskon, deskripsi, foto_url, kategori, stok, badge, aktif").eq("id", id).maybeSingle(),
    supabase.from("kategori").select("id, nama").order("nama"),
    supabase.from("foto_produk").select("id, storage_path, alt_text, urutan").eq("produk_id", id).order("urutan").order("id"),
  ]);

  const galat = pesanMigrasi(hasilProduk.error || hasilKategori.error || hasilFoto.error);
  if (!galat && !hasilProduk.data) notFound();

  const produk = hasilProduk.data;
  const foto = produk ? daftarFotoProduk(produk, hasilFoto.data || []) : [];

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      {galat ? (
        <p role="alert" className="font-semibold text-bahaya">{galat}</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_280px]">
          <FormProduk produk={produk} kategori={hasilKategori.data} action={ubahProduk.bind(null, produk.id)} labelTombol="Simpan perubahan" />
          <GaleriProduk foto={foto} nama={produk.nama} />
        </div>
      )}
    </div>
  );
}
