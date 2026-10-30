import Link from "next/link";
import NavigasiUtama from "@/components/NavigasiUtama";
import { ambilPengaturanToko } from "@/lib/pengaturan-toko";

export default async function Header() {
  const toko = await ambilPengaturanToko();

  return (
    <header className="border-b border-garis bg-latar">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-utama">
          {toko.nama}
        </Link>
        <NavigasiUtama />
      </div>
    </header>
  );
}
