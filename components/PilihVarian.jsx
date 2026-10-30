"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatRupiah } from "@/lib/format";
import { catatKlikWhatsApp, tautanWhatsApp, teksPesanVarian } from "@/lib/varian";

const MIN = 1;
const MAKS = 99;

function batasi(angka, maks) {
  return Math.min(maks, Math.max(MIN, Number.isNaN(angka) ? MIN : angka));
}

export default function PilihVarian({
  produk: produkProp,
  product,
  daftarVarian,
  variants,
  stok: stokProp,
  stock,
  onPilih,
  onSelect,
  nomorWhatsApp,
}) {
  const produk = produkProp ?? product;
  const stok = stokProp ?? stock;
  const semuaVarian = daftarVarian ?? variants ?? [];
  const idGrup = useId();
  const varianTersedia = semuaVarian.filter((v) => v.aktif !== false);
  const [varianId, setVarianId] = useState(() => (varianTersedia.find((v) => v.stok > 0) ?? varianTersedia[0])?.id ?? null);
  const [jumlah, setJumlah] = useState(MIN);

  const varian = varianTersedia.find((v) => v.id === varianId) ?? null;
  const harga = varian ? varian.harga : produk.harga;
  const stokEfektif = varian ? varian.stok : stok;
  const habis = varianTersedia.length > 0 ? !varian || varian.stok <= 0 : typeof stok === "number" && stok <= 0;
  const maksJumlah = typeof stokEfektif === "number" && stokEfektif > 0 ? Math.min(MAKS, stokEfektif) : MAKS;

  const callback = onPilih ?? onSelect;
  const refPilih = useRef(callback);
  refPilih.current = callback;
  useEffect(() => {
    refPilih.current?.({ varian, harga, habis, jumlah: Math.min(jumlah, maksJumlah) });
  }, [varian, harga, habis, jumlah, maksJumlah]);

  const pesan = teksPesanVarian({ produk, varian, jumlah });
  const tautan = tautanWhatsApp(pesan, nomorWhatsApp);
  const kelasTombolJumlah =
    "flex h-11 w-11 items-center justify-center rounded-lg border border-garis text-lg font-bold hover:bg-permukaan disabled:opacity-40";

  return (
    <div className="flex flex-col gap-4">
      {varianTersedia.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold">Pilih varian</legend>
          <div className="flex flex-wrap gap-2">
            {varianTersedia.map((item) => {
              const terpilih = item.id === varianId;
              const kosong = item.stok <= 0;
              return (
                <label
                  key={item.id}
                  className={`flex cursor-pointer flex-col rounded-lg border px-3 py-2 text-sm ${
                    terpilih ? "border-utama bg-permukaan text-utama" : "border-garis"
                  } ${kosong ? "cursor-not-allowed opacity-50" : "hover:border-utama"}`}
                >
                  <input
                    type="radio"
                    name={`${idGrup}-varian`}
                    value={item.id}
                    checked={terpilih}
                    disabled={kosong}
                    onChange={() => {
                      setVarianId(item.id);
                      setJumlah(MIN);
                    }}
                    className="sr-only"
                  />
                  <span className="font-semibold">{item.nama}</span>
                  <span className="text-teks-lembut">{kosong ? "Habis" : formatRupiah(item.harga)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga" aria-live="polite">
        {formatRupiah(harga)}
      </p>

      {callback ? null : habis ? (
        <p className="text-sm font-semibold text-bahaya">Habis. Pilih varian lain atau hubungi toko.</p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label htmlFor={`${idGrup}-jumlah`} className="text-sm font-semibold">
              Jumlah
            </label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setJumlah((n) => batasi(n - 1, maksJumlah))} disabled={jumlah <= MIN} aria-label="Kurangi jumlah" className={kelasTombolJumlah}>
                −
              </button>
              <input
                id={`${idGrup}-jumlah`}
                type="number"
                inputMode="numeric"
                min={MIN}
                max={maksJumlah}
                value={jumlah}
                onChange={(e) => setJumlah(batasi(parseInt(e.target.value, 10), maksJumlah))}
                className="h-11 w-16 rounded-lg border border-garis bg-latar text-center font-semibold"
              />
              <button type="button" onClick={() => setJumlah((n) => batasi(n + 1, maksJumlah))} disabled={jumlah >= maksJumlah} aria-label="Tambah jumlah" className={kelasTombolJumlah}>
                +
              </button>
            </div>
            <p className="text-sm text-teks-lembut" aria-live="polite">
              Total: <span className="font-bold text-teks">{formatRupiah(harga * jumlah)}</span>
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
      )}
    </div>
  );
}
