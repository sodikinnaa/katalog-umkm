"use client";

import { useEffect } from "react";

const KUNCI = "produk-terakhir";
const BATAS = 6;

export default function PelacakProdukDilihat({ produk }) {
  const { id, nama, harga, foto_url, kategori } = produk ?? {};

  useEffect(() => {
    if (id == null) return;
    try {
      let daftar = JSON.parse(localStorage.getItem(KUNCI) || "[]");
      if (!Array.isArray(daftar)) daftar = [];
      const baru = [
        { id, nama, harga, foto_url, kategori },
        ...daftar.filter((item) => item && String(item.id) !== String(id)),
      ].slice(0, BATAS);
      localStorage.setItem(KUNCI, JSON.stringify(baru));
      window.dispatchEvent(new Event("katalog-tersimpan-berubah"));
    } catch {}
  }, [id, nama, harga, foto_url, kategori]);

  return null;
}
