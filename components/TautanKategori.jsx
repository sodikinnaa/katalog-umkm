import Link from "next/link";

export default function TautanKategori({ kategori, className = "" }) {
  if (!kategori) return null;
  return (
    <Link
      href={`/kategori/${encodeURIComponent(kategori)}`}
      className={`self-start underline-offset-4 hover:text-utama hover:underline ${className}`}
    >
      {kategori}
    </Link>
  );
}
