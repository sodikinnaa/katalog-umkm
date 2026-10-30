import Link from "next/link";
import { logout } from "@/app/admin/actions";

const menu = [
  ["/admin", "Produk"],
  ["/admin/kategori", "Kategori"],
  ["/admin/ulasan", "Ulasan"],
  ["/admin/banner", "Banner"],
  ["/admin/pengaturan", "Pengaturan toko"],
  ["/admin/impor", "Impor CSV"],
  ["/admin/admins", "Admin"],
  ["/admin/log", "Log"],
  ["/admin/password", "Ganti password"],
];

export default function NavAdmin() {
  return (
    <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-garis pb-4 text-sm">
      {menu.map(([href, label]) => (
        <Link key={href} href={href} className="font-semibold hover:text-utama">
          {label}
        </Link>
      ))}
      <form action={logout} className="ml-auto">
        <button type="submit" className="text-teks-lembut hover:text-bahaya">
          Keluar
        </button>
      </form>
    </nav>
  );
}
