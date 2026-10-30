import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { pastikanAdminAktif } from "@/lib/admin/server";
import FormBanner from "./FormBanner";
import { aturStatusBanner, tambahBanner } from "./actions";

export const dynamic = "force-dynamic";

const pesanStatus = {
  ditambahkan: "Banner berhasil ditambahkan.",
  diubah: "Banner berhasil diubah.",
  diaktifkan: "Banner berhasil diaktifkan.",
  dinonaktifkan: "Banner berhasil dinonaktifkan.",
  "judul-tidak-valid": "Judul wajib diisi, maksimal 120 karakter.",
  "gambar-tidak-valid": "Link gambar harus memakai http:// atau https://.",
  "tautan-tidak-valid": "Tautan harus berupa http://, https://, atau path internal yang diawali /.",
  "gagal-tambah": "Banner gagal ditambahkan. Pastikan migrasi 007 sudah dijalankan.",
  "gagal-status": "Status banner gagal diubah.",
  "tidak-ditemukan": "Banner tidak ditemukan.",
};
const berhasil = new Set(["ditambahkan", "diubah", "diaktifkan", "dinonaktifkan"]);

export default async function HalamanBanner({ searchParams }) {
  const { supabase } = await pastikanAdminAktif();
  const { status } = await searchParams;
  const { data: banners, error } = await supabase
    .from("banner")
    .select("id, judul, teks, gambar_url, tautan, aktif, urutan")
    .order("urutan", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw new Error(`Gagal mengambil banner. Pastikan migrasi 007 sudah dijalankan. (${error.message})`);

  return (
    <div className="flex flex-col gap-8 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Banner promo</h1>
        <p className="mt-1 text-sm text-teks-lembut">Banner aktif pertama berdasarkan urutan tampil di beranda.</p>
      </div>
      {pesanStatus[status] && (
        <p role="alert" className={`text-sm font-semibold ${berhasil.has(status) ? "text-harga" : "text-bahaya"}`}>
          {pesanStatus[status]}
        </p>
      )}

      <section aria-labelledby="judul-tambah" className="flex flex-col gap-4 rounded-2xl border border-garis p-5">
        <h2 id="judul-tambah" className="text-lg font-extrabold">Tambah banner</h2>
        <FormBanner action={tambahBanner} labelTombol="Simpan banner" />
      </section>

      <section aria-labelledby="judul-daftar" className="flex flex-col gap-3">
        <h2 id="judul-daftar" className="text-lg font-extrabold">Daftar banner</h2>
        {!banners?.length ? (
          <p className="rounded-2xl border border-garis bg-permukaan p-6 text-teks-lembut">Belum ada banner.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-garis">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-permukaan text-teks-lembut">
                <tr>
                  <th className="px-4 py-3 font-semibold">Banner</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3"><span className="sr-only">Aksi</span></th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner.id} className="border-t border-garis">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{banner.judul}</p>
                      {banner.teks && <p className="max-w-lg truncate text-teks-lembut">{banner.teks}</p>}
                    </td>
                    <td className="px-4 py-3">{banner.aktif ? "Aktif" : "Nonaktif"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Tombol href={`/admin/banner/${banner.id}/ubah`} varian="garis">Ubah</Tombol>
                        <form action={aturStatusBanner}>
                          <input type="hidden" name="id" value={banner.id} />
                          <input type="hidden" name="aktif" value={String(!banner.aktif)} />
                          <Tombol type="submit" varian={banner.aktif ? "bahaya" : "garis"}>
                            {banner.aktif ? "Nonaktifkan" : "Aktifkan"}
                          </Tombol>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
