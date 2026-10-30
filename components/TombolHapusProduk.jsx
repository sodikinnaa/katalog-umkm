"use client";

import Tombol from "@/components/Tombol";
import { hapusProduk } from "@/app/admin/actions";

export default function TombolHapusProduk({ id, nama }) {
  function tanganiHapus(e) {
    const setuju = window.confirm(`Apakah Anda yakin ingin menghapus produk "${nama}"?`);
    if (!setuju) {
      e.preventDefault();
    }
  }

  return (
    <form action={hapusProduk} onSubmit={tanganiHapus}>
      <input type="hidden" name="id" value={id} />
      <Tombol type="submit" varian="bahaya">
        Hapus
      </Tombol>
    </form>
  );
}
