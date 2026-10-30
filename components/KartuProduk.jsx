import Link from "next/link";
import TautanKategori from "@/components/TautanKategori";
import { formatRupiah } from "@/lib/format";
import { hargaProduk, produkHabis } from "@/lib/produk-util";

export default function KartuProduk({ produk }) {
  if (produk.aktif === false) return null;
  const href = `/produk/${produk.id}`;
  const habis = produkHabis(produk);
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar">
      {(produk.badge || habis) && (
        <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1">
          {produk.badge && <span className="rounded-md bg-utama px-2 py-1 text-xs font-bold text-white">{produk.badge}</span>}
          {habis && <span className="rounded-md bg-bahaya px-2 py-1 text-xs font-bold text-white">Habis</span>}
        </div>
      )}
      <Link href={href} tabIndex={-1} aria-hidden="true">
        <img src={produk.foto_url} alt={produk.nama} className="aspect-square w-full bg-permukaan object-cover" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <TautanKategori kategori={produk.kategori} className="text-xs text-teks-lembut" />
        <Link href={href} className="flex flex-1 flex-col gap-2">
          <h3 className="font-semibold leading-snug group-hover:text-utama">{produk.nama}</h3>
          <div className="mt-auto self-start rounded-md bg-harga-latar px-2 py-1 text-sm text-harga">
            {produk.harga_diskon != null && <s className="mr-2 text-xs text-teks-lembut">{formatRupiah(produk.harga)}</s>}
            <span className="font-bold">{formatRupiah(hargaProduk(produk))}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
