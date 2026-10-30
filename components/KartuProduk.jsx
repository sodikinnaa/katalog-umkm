import Link from "next/link";
import TautanKategori from "@/components/TautanKategori";
import { formatRupiah } from "@/lib/format";

export default function KartuProduk({ produk }) {
  const href = `/produk/${produk.id}`;
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar">
      <Link href={href} tabIndex={-1} aria-hidden="true">
        <img
          src={produk.foto_url}
          alt={produk.nama}
          className="aspect-square w-full bg-permukaan object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <TautanKategori kategori={produk.kategori} className="text-xs text-teks-lembut" />
        <Link href={href} className="flex flex-1 flex-col gap-2">
          <h3 className="font-semibold leading-snug group-hover:text-utama">{produk.nama}</h3>
          <p className="mt-auto self-start rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga">
            {formatRupiah(produk.harga)}
          </p>
        </Link>
      </div>
    </div>
  );
}
