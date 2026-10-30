"use client";

import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";
import { catatKlikWhatsApp } from "@/lib/varian";

export default function TombolWhatsApp({ produk }) {
  const harga = formatRupiah(produk.harga);
  const pesan = `Halo, saya mau pesan ${produk.nama} (${harga})`;
  const tautan = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;

  return (
    <a
      href={tautan}
      target="_blank"
      rel="noreferrer"
      onClick={() => catatKlikWhatsApp(produk.id)}
      className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
    >
      Pesan via WhatsApp
    </a>
  );
}
