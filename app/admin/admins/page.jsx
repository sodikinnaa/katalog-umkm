import NavAdmin from "@/components/NavAdmin";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import FormKonfirmasi from "@/components/FormKonfirmasi";
import { galatTabel, pastikanAdminAktif } from "@/lib/admin/server";
import { supabasePublik } from "@/lib/supabase/server";
import { aturStatusAdmin, hapusAdmin, tambahAdmin } from "./actions";

export const dynamic = "force-dynamic";

const pesanStatus = {
  ditambahkan: "Admin berhasil ditambahkan.",
  diaktifkan: "Admin berhasil diaktifkan.",
  dinonaktifkan: "Admin berhasil dinonaktifkan.",
  dihapus: "Admin berhasil dihapus.",
  "input-tidak-valid": "Nama, email, dan password minimal 8 karakter wajib diisi.",
  "gagal-tambah": "Admin gagal ditambahkan. Periksa apakah email sudah terdaftar.",
  "aksi-ditolak": "Akun sendiri tidak boleh dinonaktifkan atau dihapus.",
  "admin-tidak-ditemukan": "Admin tidak ditemukan.",
  "gagal-hapus": "Admin gagal dihapus.",
};

const statusBerhasil = new Set(["ditambahkan", "diaktifkan", "dinonaktifkan", "dihapus"]);

export default async function HalamanAdmins({ searchParams }) {
  const { user } = await pastikanAdminAktif();
  const { status } = await searchParams;
  const admin = supabasePublik();
  const { data: profil, error } = await admin
    .from("admin_profile")
    .select("user_id, nama, aktif, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    throw galatTabel("admin_profile", error);
  }

  const { data: authData, error: authError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (authError) {
    throw new Error(`Gagal mengambil akun Supabase Auth: ${authError.message}`);
  }

  const authById = new Map(authData.users.map((akun) => [akun.id, akun]));

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Kelola admin</h1>
        <p className="mt-1 text-sm text-teks-lembut">Tambah akun atau atur akses admin lain.</p>
      </div>

      {pesanStatus[status] && (
        <p role="alert" className={`text-sm font-semibold ${statusBerhasil.has(status) ? "text-harga" : "text-bahaya"}`}>
          {pesanStatus[status]}
        </p>
      )}

      <form action={tambahAdmin} className="grid max-w-2xl gap-4 rounded-2xl border border-garis p-5 sm:grid-cols-2">
        <h2 className="text-lg font-extrabold sm:col-span-2">Tambah admin</h2>
        <Input label="Nama" name="nama" required maxLength={100} />
        <Input label="Email" name="email" type="email" autoComplete="email" required />
        <Input label="Password sementara" name="password" type="password" autoComplete="new-password" minLength={8} required />
        <div className="flex items-end">
          <Tombol type="submit">Tambah admin</Tombol>
        </div>
      </form>

      <section aria-labelledby="judul-daftar" className="flex flex-col gap-3">
        <h2 id="judul-daftar" className="text-lg font-extrabold">Daftar admin</h2>
        <div className="overflow-x-auto rounded-2xl border border-garis">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-permukaan text-teks-lembut">
              <tr>
                <th className="px-4 py-3 font-semibold">Admin</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Dibuat</th>
                <th className="px-4 py-3"><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody>
              {profil.map((item) => {
                const akun = authById.get(item.user_id);
                const sendiri = item.user_id === user.id;
                return (
                  <tr key={item.user_id} className="border-t border-garis">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{item.nama}{sendiri ? " (Anda)" : ""}</p>
                      <p className="text-teks-lembut">{akun?.email || "Email Auth tidak ditemukan"}</p>
                    </td>
                    <td className="px-4 py-3">{item.aktif ? "Aktif" : "Nonaktif"}</td>
                    <td className="px-4 py-3 text-teks-lembut">{new Date(item.created_at).toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3">
                      {!sendiri && (
                        <div className="flex justify-end gap-2">
                          <form action={aturStatusAdmin}>
                            <input type="hidden" name="user_id" value={item.user_id} />
                            <input type="hidden" name="aktif" value={String(!item.aktif)} />
                            <Tombol type="submit" varian="garis">{item.aktif ? "Nonaktifkan" : "Aktifkan"}</Tombol>
                          </form>
                          <FormKonfirmasi action={hapusAdmin} pesan={`Hapus admin ${item.nama}? Akun login juga akan dihapus.`}>
                            <input type="hidden" name="user_id" value={item.user_id} />
                            <Tombol type="submit" varian="bahaya">Hapus</Tombol>
                          </FormKonfirmasi>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
