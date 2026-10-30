import NavAdmin from "@/components/NavAdmin";
import Tombol from "@/components/Tombol";
import FormKonfirmasi from "@/components/FormKonfirmasi";
import { pastikanAdminAktif } from "@/lib/admin/server";
import { hapusUlasan, ubahTampilUlasan } from "./actions";

export const dynamic = "force-dynamic";

export default async function HalamanAdminUlasan() {
  const { supabase } = await pastikanAdminAktif();
  const { data: daftarUlasan, error } = await supabase
    .from("ulasan")
    .select("id, nama, rating, komentar, tampil, created_at, produk:produk_id(id, nama)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Gagal memuat ulasan: ${error.message}`);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Moderasi ulasan</h1>
        <p className="mt-1 text-sm text-teks-lembut">Sembunyikan atau hapus ulasan pembeli.</p>
      </div>
      {daftarUlasan.length === 0 ? (
        <p className="rounded-2xl border border-garis bg-permukaan p-6 text-teks-lembut">Belum ada ulasan.</p>
      ) : (
        <div className="grid gap-4">
          {daftarUlasan.map((ulasan) => (
            <article key={ulasan.id} className="rounded-2xl border border-garis p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">{ulasan.nama} · {ulasan.rating}/5</h2>
                  <p className="text-sm text-teks-lembut">{ulasan.produk?.nama || "Produk telah dihapus"} · {new Date(ulasan.created_at).toLocaleString("id-ID")}</p>
                </div>
                <span className={`rounded-md px-2 py-1 text-xs font-semibold ${ulasan.tampil ? "bg-permukaan text-utama" : "bg-permukaan text-teks-lembut"}`}>
                  {ulasan.tampil ? "Tampil" : "Disembunyikan"}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-teks-lembut">{ulasan.komentar}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={ubahTampilUlasan}>
                  <input type="hidden" name="id" value={ulasan.id} />
                  <input type="hidden" name="tampil" value={String(!ulasan.tampil)} />
                  <Tombol type="submit" varian="garis">{ulasan.tampil ? "Sembunyikan" : "Tampilkan"}</Tombol>
                </form>
                <FormKonfirmasi action={hapusUlasan} pesan={`Hapus ulasan dari ${ulasan.nama}?`}>
                  <input type="hidden" name="id" value={ulasan.id} />
                  <Tombol type="submit" varian="bahaya">Hapus</Tombol>
                </FormKonfirmasi>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
