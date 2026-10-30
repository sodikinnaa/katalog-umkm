import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { supabaseSesi } from "@/lib/supabase/server";
import { ubahProduk } from "@/app/admin/actions";

export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;
  const supabase = await supabaseSesi();

  const { data: produk, error } = await supabase
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
      <FormProduk produk={produk} action={ubahProdukDenganId} labelTombol="Simpan perubahan" />
    </div>
  );
}
