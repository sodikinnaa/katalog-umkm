import Link from "next/link";
import { toko } from "@/lib/toko";
import TombolModeGelap from "@/components/TombolModeGelap";

export default function Header() {
  return (
    <header className="border-b border-garis bg-latar">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-utama">
          {toko.nama}
        </Link>
        <nav className="flex items-center gap-3 text-sm font-semibold">
          <Link href="/favorit" className="hover:text-utama">
            Favorit
          </Link>
          <TombolModeGelap />
        </nav>
      </div>
    </header>
  );
}
