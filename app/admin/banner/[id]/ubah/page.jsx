import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import { pastikanAdminAktif } from "@/lib/admin/server";
import FormBanner from "../../FormBanner";
import { ubahBanner } from "../../actions";

const pesanStatus = {
  "judul-tidak-valid": "Judul wajib diisi, maksimal 120 karakter.",
  "gambar-tidak-valid": "Link gambar harus memakai http:// atau https://.",
  "tautan-tidak-valid": "Tautan harus berupa http://, https://, atau path internal yang diawali /.",
  gagal: "Perubahan banner gagal disimpan.",
};

export default async function HalamanUbahBanner({ params, searchParams }) {
  const { supabase } = await pastikanAdminAktif();
  const { id } = await params;
  const { status } = await searchParams;
  const bannerId = Number.parseInt(id, 10);
  if (!Number.isSafeInteger(bannerId) || bannerId < 1) notFound();

  const { data: banner, error } = await supabase
    .from("banner")
    .select("id, judul, teks, gambar_url, tautan")
    .eq("id", bannerId)
    .maybeSingle();
  if (error) throw new Error(`Gagal mengambil banner: ${error.message}`);
  if (!banner) notFound();

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah banner</h1>
      {pesanStatus[status] && <p role="alert" className="text-sm font-semibold text-bahaya">{pesanStatus[status]}</p>}
      <FormBanner banner={banner} action={ubahBanner.bind(null, banner.id)} labelTombol="Simpan perubahan" />
    </div>
  );
}
