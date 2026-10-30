"use client";

import { useState } from "react";

export default function GaleriProduk({ foto = [], nama = "Foto produk" }) {
  const daftar = foto.filter((item) => item?.url);
  const [aktif, setAktif] = useState(0);
  if (daftar.length === 0) return null;

  const utama = daftar[Math.min(aktif, daftar.length - 1)];
  return (
    <div className="flex flex-col gap-3">
      <img
        src={utama.url}
        alt={utama.alt_text || nama}
        className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover"
      />
      {daftar.length > 1 && (
        <div className="grid grid-cols-5 gap-2" aria-label="Pilihan foto produk">
          {daftar.map((item, index) => (
            <button
              key={item.id ?? item.url}
              type="button"
              onClick={() => setAktif(index)}
              aria-label={`Tampilkan foto ${index + 1}`}
              aria-pressed={index === aktif}
              className={`overflow-hidden rounded-lg border-2 ${index === aktif ? "border-utama" : "border-garis"}`}
            >
              <img src={item.url} alt="" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
