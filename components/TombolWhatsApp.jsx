"use client";

import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";
import { catatKlikWhatsApp } from "@/lib/varian";

// Tombol pesan WhatsApp (US-03).
// Nomor tujuan diambil dari lib/toko.js. Jika halaman mengirim prop `nomorWhatsApp`
// (misalnya dari pengaturan toko di database), nomor itu yang dipakai.
export default function TombolWhatsApp({ produk, nomorWhatsApp }) {
  const nomor = nomorWhatsApp || toko.nomorWhatsApp;
  const harga = formatRupiah(produk.harga);
  const pesan = `Halo, saya mau pesan ${produk.nama} (${harga})`;
  const tautan = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

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
