"use client";

import { useEffect, useState } from "react";
import KartuProduk from "@/components/KartuProduk";
import Tombol from "@/components/Tombol";

function baca(kunci) {
  try {
    const data = JSON.parse(localStorage.getItem(kunci) || "[]");
    return Array.isArray(data) ? data.filter((item) => item && item.id != null) : [];
  } catch {
    return [];
  }
}

export default function KatalogTersimpan({ mode = "ringkasan" }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const muat = () => setData({ favorit: baca("produk-favorit"), terakhir: baca("produk-terakhir").slice(0, 6) });
    muat();
    window.addEventListener("storage", muat);
    window.addEventListener("katalog-tersimpan-berubah", muat);
    return () => {
      window.removeEventListener("storage", muat);
      window.removeEventListener("katalog-tersimpan-berubah", muat);
    };
  }, []);

  if (mode === "favorit") {
    if (!data) return <p className="text-teks-lembut">Memuat produk favorit...</p>;
    if (data.favorit.length === 0) {
      return (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-garis bg-permukaan px-4 py-8 text-center">
          <p className="text-teks-lembut">Belum ada produk favorit. Tandai produk yang kamu suka agar mudah ditemukan lagi.</p>
          <Tombol href="/">Lihat katalog</Tombol>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {data.favorit.map((produk) => (
          <KartuProduk key={produk.id} produk={produk} />
        ))}
      </div>
    );
  }

  if (!data || data.terakhir.length === 0) return null;

  return (
    <section aria-labelledby="judul-terakhir" className="mb-10 flex flex-col gap-5">
      <h2 id="judul-terakhir" className="text-xl font-bold">
        Terakhir dilihat
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {data.terakhir.map((produk) => (
          <KartuProduk key={produk.id} produk={produk} />
        ))}
      </div>
    </section>
  );
}
