import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import FormKonfirmasi from "@/components/FormKonfirmasi";
import { galatTabel, pastikanAdminAktif } from "@/lib/admin/server";
import { formatRupiah } from "@/lib/format";
import { KOLOM_VARIAN } from "@/lib/varian";
import { aturAktifVarian, geserVarian, hapusVarian, tambahVarian, ubahVarian } from "./actions";

export const dynamic = "force-dynamic";

const pesanStatus = {
  ditambahkan: "Varian berhasil ditambahkan.",
  diubah: "Varian berhasil diubah.",
  dihapus: "Varian berhasil dihapus.",
  diaktifkan: "Varian berhasil diaktifkan.",
  dinonaktifkan: "Varian berhasil dinonaktifkan.",
  diurutkan: "Urutan varian berhasil diubah.",
  "urutan-tetap": "Varian sudah berada di batas urutan.",
  "input-nama": "Nama varian wajib diisi, maksimal 100 karakter.",
  "input-harga": "Harga harus berupa angka bulat positif.",
  "input-stok": "Stok harus berupa angka bulat nol atau lebih.",
  "input-urutan": "Urutan harus berupa angka bulat nol atau lebih.",
  "nama-duplikat": "Nama varian sudah dipakai pada produk ini.",
  "produk-tidak-ditemukan": "Produk tidak ditemukan.",
  "varian-tidak-ditemukan": "Varian tidak ditemukan.",
};

const statusBerhasil = new Set(["ditambahkan", "diubah", "dihapus", "diaktifkan", "dinonaktifkan", "diurutkan"]);

function FormVarian({ action, varian, label }) {
  return (
    <form action={action} className="grid gap-3 rounded-xl border border-garis p-4 sm:grid-cols-5">
      {varian && <input type="hidden" name="varian_id" value={varian.id} />}
      <Input label="Nama varian" name="nama" defaultValue={varian?.nama} required maxLength={100} />
      <Input label="Harga" name="harga" type="number" defaultValue={varian?.harga} min={1} step={1} required />
      <Input label="Stok" name="stok" type="number" defaultValue={varian?.stok ?? 0} min={0} step={1} required />
      <Input label="Urutan" name="urutan" type="number" defaultValue={varian?.urutan ?? 0} min={0} step={1} required />
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex h-11 items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="aktif" defaultChecked={varian?.aktif ?? true} className="h-4 w-4 accent-utama" />
          Aktif
        </label>
        <Tombol type="submit">{label}</Tombol>
      </div>
    </form>
  );
}

export default async function HalamanVarian({ params, searchParams }) {
  const { id } = await params;
  const { status } = await searchParams;
  const { supabase } = await pastikanAdminAktif();
  const { data: produk, error: produkError } = await supabase.from("produk").select("id, nama").eq("id", id).maybeSingle();
  if (produkError) throw galatTabel("produk", produkError);
  if (!produk) notFound();

  const { data: daftar, error } = await supabase
    .from("varian_produk")
    .select(KOLOM_VARIAN)
    .eq("produk_id", produk.id)
    .order("urutan", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw galatTabel("varian_produk", error);

  const tambah = tambahVarian.bind(null, produk.id);
  const ubah = ubahVarian.bind(null, produk.id);
  const hapus = hapusVarian.bind(null, produk.id);
  const aturAktif = aturAktifVarian.bind(null, produk.id);
  const geser = geserVarian.bind(null, produk.id);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Varian {produk.nama}</h1>
        <p className="mt-1 text-sm text-teks-lembut">Kelola ukuran, harga, stok, status, dan urutan tampil.</p>
      </div>

      {pesanStatus[status] && (
        <p role="alert" className={`text-sm font-semibold ${statusBerhasil.has(status) ? "text-harga" : "text-bahaya"}`}>
          {pesanStatus[status]}
        </p>
      )}

      <section aria-labelledby="judul-tambah" className="flex flex-col gap-3">
        <h2 id="judul-tambah" className="text-lg font-extrabold">Tambah varian</h2>
        <FormVarian action={tambah} label="Tambah varian" />
      </section>

      <section aria-labelledby="judul-daftar" className="flex flex-col gap-3">
        <h2 id="judul-daftar" className="text-lg font-extrabold">Daftar varian</h2>
        {daftar.length === 0 ? (
          <p className="rounded-xl border border-garis p-4 text-sm text-teks-lembut">Belum ada varian untuk produk ini.</p>
        ) : (
          daftar.map((varian, index) => (
            <article key={varian.id} className="flex flex-col gap-3 rounded-2xl border border-garis p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold">{varian.nama}</h3>
                  <p className="text-sm text-teks-lembut">{formatRupiah(varian.harga)} · stok {varian.stok} · {varian.aktif ? "Aktif" : "Nonaktif"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={geser}>
                    <input type="hidden" name="varian_id" value={varian.id} />
                    <input type="hidden" name="arah" value="naik" />
                    <Tombol type="submit" varian="garis" disabled={index === 0}>Naik</Tombol>
                  </form>
                  <form action={geser}>
                    <input type="hidden" name="varian_id" value={varian.id} />
                    <input type="hidden" name="arah" value="turun" />
                    <Tombol type="submit" varian="garis" disabled={index === daftar.length - 1}>Turun</Tombol>
                  </form>
                  <form action={aturAktif}>
                    <input type="hidden" name="varian_id" value={varian.id} />
                    <Tombol type="submit" varian="garis">{varian.aktif ? "Nonaktifkan" : "Aktifkan"}</Tombol>
                  </form>
                  <FormKonfirmasi action={hapus} pesan={`Hapus varian ${varian.nama}?`}>
                    <input type="hidden" name="varian_id" value={varian.id} />
                    <Tombol type="submit" varian="bahaya">Hapus</Tombol>
                  </FormKonfirmasi>
                </div>
              </div>
              <details>
                <summary className="cursor-pointer text-sm font-semibold text-utama">Ubah varian</summary>
                <div className="mt-3"><FormVarian action={ubah} varian={varian} label="Simpan perubahan" /></div>
              </details>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
