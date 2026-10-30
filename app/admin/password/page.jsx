import NavAdmin from "@/components/NavAdmin";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { gantiPassword } from "@/app/admin/actions";

const pesanStatus = {
  pendek: { teks: "Password baru minimal 8 karakter.", kelas: "text-bahaya" },
  beda: { teks: "Konfirmasi password tidak sama.", kelas: "text-bahaya" },
  gagal: { teks: "Password gagal diganti. Silakan coba lagi.", kelas: "text-bahaya" },
  berhasil: { teks: "Password berhasil diganti.", kelas: "text-harga" },
};

export default async function HalamanGantiPassword({ searchParams }) {
  const { status } = await searchParams;
  const pesan = pesanStatus[status];
  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Ganti password</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Ganti password bawaan segera setelah pertama kali masuk. Minimal 8 karakter.
        </p>
      </div>
      <form action={gantiPassword} className="flex max-w-sm flex-col gap-4">
        {pesan && (
          <p role="alert" className={`text-sm font-semibold ${pesan.kelas}`}>
            {pesan.teks}
          </p>
        )}
        <Input
          label="Password baru"
          name="password_baru"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Input
          label="Ulangi password baru"
          name="konfirmasi_password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Tombol type="submit" className="self-start">
          Simpan password
        </Tombol>
      </form>
    </div>
  );
}
