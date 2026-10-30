import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { login } from "@/app/admin/actions";

const pesanError = {
  kosong: "Email dan password wajib diisi.",
  salah: "Email atau password salah.",
};

export default async function HalamanLogin({ searchParams }) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-12">
      <div>
        <h1 className="text-2xl font-extrabold">Masuk admin</h1>
        <p className="mt-1 text-sm text-teks-lembut">Khusus pemilik toko untuk mengelola produk.</p>
      </div>
      <form action={login} className="flex flex-col gap-4">
        {pesanError[error] && (
          <p role="alert" className="text-sm font-semibold text-bahaya">
            {pesanError[error]}
          </p>
        )}
        <Input label="Email" name="email" type="email" autoComplete="email" required />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <Tombol type="submit">Masuk</Tombol>
      </form>
    </div>
  );
}
