import Link from "next/link";
import TombolModeGelap from "@/components/TombolModeGelap";
import { ambilPengaturanToko } from "@/lib/pengaturan-toko";

export default async function Header() {
  const toko = await ambilPengaturanToko();

  return (
    <header className="border-b border-garis bg-latar">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-utama">
          {toko.nama}
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-3 text-sm font-semibold" aria-label="Navigasi utama">
          <Link href="/keranjang" className="hover:text-utama">
            Keranjang
          </Link>
          <Link href="/bandingkan" className="hover:text-utama">
            Bandingkan
          </Link>
          <Link href="/favorit" className="hover:text-utama">
            Favorit
          </Link>
          <TombolModeGelap />
        </nav>
      </div>
    </header>
  );
}
