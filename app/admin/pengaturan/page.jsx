import NavAdmin from "@/components/NavAdmin";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { pastikanAdminAktif } from "@/lib/admin/server";
import { ambilPengaturanToko } from "@/lib/pengaturan-toko";
import { simpanPengaturanToko } from "./actions";

export const dynamic = "force-dynamic";

const pesanStatus = {
  tersimpan: { teks: "Pengaturan toko tersimpan.", kelas: "text-harga" },
  "input-tidak-valid": { teks: "Nama (maks 100 karakter), alamat, dan jam buka wajib diisi.", kelas: "text-bahaya" },
  "nomor-tidak-valid": {
    teks: "Nomor WhatsApp harus 8 sampai 15 digit, format internasional tanpa + (contoh 6281234567890).",
    kelas: "text-bahaya",
  },
  gagal: { teks: "Pengaturan gagal disimpan. Pastikan migrasi 007 sudah dijalankan.", kelas: "text-bahaya" },
};

export default async function HalamanPengaturan({ searchParams }) {
  await pastikanAdminAktif();
  const { status } = await searchParams;
  const pesan = pesanStatus[status];
  const toko = await ambilPengaturanToko();

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Pengaturan toko</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Dipakai di header, footer, halaman tentang, dan tombol pesan WhatsApp.
          {!toko.dariDatabase && " Saat ini masih memakai nilai dari lib/toko.js."}
        </p>
      </div>
      <form action={simpanPengaturanToko} className="flex max-w-xl flex-col gap-4">
        {pesan && (
          <p role="alert" className={`text-sm font-semibold ${pesan.kelas}`}>
            {pesan.teks}
          </p>
        )}
        <Input label="Nama toko" name="nama" defaultValue={toko.nama} maxLength={100} required />
        <Input
          label="Nomor WhatsApp"
          name="nomor_whatsapp"
          type="tel"
          inputMode="numeric"
          defaultValue={toko.nomorWhatsApp}
          placeholder="6281234567890"
          pattern="[0-9+\-\s]{8,20}"
          required
        />
        <Input label="Jam buka" name="jam_buka" defaultValue={toko.jamBuka} maxLength={200} required />
        <Input label="Alamat" name="alamat" textarea defaultValue={toko.alamat} maxLength={500} required />
        <Tombol type="submit" className="self-start">
          Simpan pengaturan
        </Tombol>
      </form>
    </div>
  );
}
