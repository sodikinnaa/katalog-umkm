import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { supabasePublik } from "@/lib/supabase/server";
import { ubahProduk } from "@/app/admin/actions";

export default async function HalamanUbahProduk({ params, searchParams }) {
  const { id } = await params;
  const { error: errorQuery } = await searchParams;

  const { data: produk, error } = await supabasePublik()
    .from("produk")
    .select("id, nama, harga, deskripsi, foto_url, kategori")
    .eq("id", id)
    .maybeSingle();

  if (error || !produk) {
    notFound();
  }

  const ubahProdukDenganId = ubahProduk.bind(null, produk.id);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      {errorQuery && (
        <p role="alert" className="text-sm font-semibold text-bahaya">
          Data tidak valid. Pastikan nama dan harga terisi dengan benar.
        </p>
      )}
      <FormProduk produk={produk} action={ubahProdukDenganId} labelTombol="Simpan perubahan" />
    </div>
  );
}
