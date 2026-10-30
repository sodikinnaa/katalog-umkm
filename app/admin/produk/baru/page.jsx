import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { tambahProduk } from "@/app/admin/actions";
import { supabaseSesi } from "@/lib/supabase/server";
import { pesanMigrasi } from "@/lib/produk";

export default async function HalamanTambahProduk() {
  const { data: kategori, error } = await (await supabaseSesi()).from("kategori").select("id, nama").order("nama");
  const galat = pesanMigrasi(error, "002");
  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>
      {galat ? <p role="alert" className="font-semibold text-bahaya">{galat}</p> : <FormProduk action={tambahProduk} kategori={kategori} labelTombol="Simpan produk" />}
    </div>
  );
}
