import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import { supabaseSesi } from "@/lib/supabase/server";
import { pesanMigrasi } from "@/lib/produk";
import { hapusKategori, tambahKategori, ubahKategori } from "./actions";

const PESAN = {
  "nama-tidak-valid": "Nama kategori wajib diisi dan maksimal 100 karakter.",
  "sudah-ada": "Kategori dengan nama tersebut sudah ada.",
  "masih-dipakai": "Kategori tidak dapat dihapus karena masih dipakai produk.",
  gagal: "Aksi kategori gagal. Silakan coba lagi.",
  ditambahkan: "Kategori berhasil ditambahkan.",
  diubah: "Kategori berhasil diubah.",
  dihapus: "Kategori berhasil dihapus.",
};

export default async function HalamanKategoriAdmin({ searchParams }) {
  const { status } = await searchParams;
  const { data, error } = await (await supabaseSesi()).from("kategori").select("id, nama, slug").order("nama");
  const galat = pesanMigrasi(error, "002");
  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Kategori</h1>
      {galat ? (
        <p role="alert" className="font-semibold text-bahaya">{galat}</p>
      ) : (
        <>
          {PESAN[status] && <p role="status" className={`rounded-lg border border-garis bg-permukaan p-4 text-sm font-semibold ${["ditambahkan", "diubah", "dihapus"].includes(status) ? "text-utama" : "text-bahaya"}`}>{PESAN[status]}</p>}
          <form action={tambahKategori} className="flex max-w-xl items-end gap-2">
            <label className="flex flex-1 flex-col gap-1.5 text-sm font-semibold">Nama kategori<input name="nama" maxLength={100} required className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base" /></label>
            <Tombol type="submit">Tambah kategori</Tombol>
          </form>
          {data.length === 0 ? <p className="text-teks-lembut">Belum ada kategori.</p> : (
            <div className="overflow-x-auto rounded-2xl border border-garis">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-permukaan text-teks-lembut"><tr><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3"><span className="sr-only">Aksi</span></th></tr></thead>
                <tbody>{data.map((item) => (
                  <tr key={item.id} className="border-t border-garis">
                    <td className="px-4 py-3"><form action={ubahKategori} className="flex gap-2"><input type="hidden" name="id" value={item.id} /><input name="nama" defaultValue={item.nama} maxLength={100} required className="min-w-0 flex-1 rounded-lg border border-garis px-3 py-2" /><Tombol type="submit" varian="garis">Simpan</Tombol></form></td>
                    <td className="px-4 py-3 text-teks-lembut">{item.slug}</td>
                    <td className="px-4 py-3"><form action={hapusKategori}><input type="hidden" name="id" value={item.id} /><Tombol type="submit" varian="bahaya">Hapus</Tombol></form></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
