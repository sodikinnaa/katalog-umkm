"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";
import { catatKlikWhatsApp } from "@/lib/varian";

const MIN = 1;
const MAKS = 99;

function batasi(angka) {
  return Math.min(MAKS, Math.max(MIN, Number.isNaN(angka) ? MIN : angka));
}

export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(MIN);
  const total = produk.harga * jumlah;
  const pesan = `Halo, saya ingin memesan ${produk.nama} sebanyak ${jumlah} pcs dengan harga ${formatRupiah(produk.harga)} per pcs. Total ${formatRupiah(total)}.`;
  const tautan = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;
  const kelasTombolJumlah =
    "flex h-11 w-11 items-center justify-center rounded-lg border border-garis text-lg font-bold hover:bg-permukaan disabled:opacity-40";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label htmlFor="jumlah-pesanan" className="text-sm font-semibold">
          Jumlah
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setJumlah((n) => batasi(n - 1))}
            disabled={jumlah <= MIN}
            aria-label="Kurangi jumlah"
            className={kelasTombolJumlah}
          >
            −
          </button>
          <input
            id="jumlah-pesanan"
            type="number"
            inputMode="numeric"
            min={MIN}
            max={MAKS}
            value={jumlah}
            onChange={(e) => setJumlah(batasi(parseInt(e.target.value, 10)))}
            className="h-11 w-16 rounded-lg border border-garis bg-latar text-center font-semibold"
          />
          <button
            type="button"
            onClick={() => setJumlah((n) => batasi(n + 1))}
            disabled={jumlah >= MAKS}
            aria-label="Tambah jumlah"
            className={kelasTombolJumlah}
          >
            +
          </button>
        </div>
        <p className="text-sm text-teks-lembut" aria-live="polite">
          Total: <span className="font-bold text-teks">{formatRupiah(total)}</span>
        </p>
      </div>
      <a
        href={tautan}
        target="_blank"
        rel="noreferrer"
        onClick={() => catatKlikWhatsApp(produk.id)}
        className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto sm:self-start"
      >
        Pesan via WhatsApp
      </a>
    </div>
  );
}
