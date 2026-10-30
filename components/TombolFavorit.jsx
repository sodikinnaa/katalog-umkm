"use client";

import { useEffect, useState } from "react";
import Tombol from "@/components/Tombol";

const KUNCI = "produk-favorit";

function bacaFavorit() {
  try {
    const data = JSON.parse(localStorage.getItem(KUNCI) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default function TombolFavorit({ produk }) {
  const [favorit, setFavorit] = useState(false);

  useEffect(() => {
    setFavorit(bacaFavorit().some((item) => String(item.id) === String(produk.id)));
  }, [produk.id]);

  function toggle() {
    const daftar = bacaFavorit();
    const sudahAda = daftar.some((item) => String(item.id) === String(produk.id));
    const ringkas = {
      id: produk.id,
      nama: produk.nama,
      harga: produk.harga,
      foto_url: produk.foto_url,
      kategori: produk.kategori,
    };
    const baru = sudahAda
      ? daftar.filter((item) => String(item.id) !== String(produk.id))
      : [ringkas, ...daftar];
    localStorage.setItem(KUNCI, JSON.stringify(baru));
    setFavorit(!sudahAda);
    window.dispatchEvent(new Event("katalog-tersimpan-berubah"));
  }

  return (
    <Tombol type="button" varian="garis" onClick={toggle} aria-pressed={favorit}>
      {favorit ? "Hapus dari favorit" : "Tambah ke favorit"}
    </Tombol>
  );
}
