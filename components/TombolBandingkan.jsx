"use client";

import { useId, useState } from "react";
import Link from "next/link";
import Tombol from "@/components/Tombol";
import {
  MAKS_BANDINGKAN,
  bacaBandingkan,
  simpanBandingkan,
  usePilihan,
} from "@/components/PengelolaPilihanProduk";

export default function TombolBandingkan({ produk }) {
  const ids = usePilihan(bacaBandingkan) ?? [];
  const [pesan, setPesan] = useState("");
  const idStatus = useId();
  const id = String(produk.id);
  const dipilih = ids.includes(id);

  function toggle() {
    if (dipilih) {
      simpanBandingkan(ids.filter((x) => x !== id));
      setPesan("Dihapus dari perbandingan.");
      return;
    }
    if (ids.length >= MAKS_BANDINGKAN) {
      setPesan(`Maksimal ${MAKS_BANDINGKAN} produk. Hapus salah satu pilihan di halaman Bandingkan terlebih dahulu.`);
      return;
    }
    if (!simpanBandingkan([...ids, id])) {
      setPesan("Pilihan gagal disimpan. Pastikan penyimpanan browser aktif.");
      return;
    }
    setPesan(ids.length + 1 === MAKS_BANDINGKAN ? "Dua produk siap dibandingkan." : "Dipilih. Pilih satu produk lagi.");
  }

  const penuh = !dipilih && ids.length >= MAKS_BANDINGKAN;

  return (
    <div className="flex flex-col items-start gap-2">
      <Tombol type="button" varian="garis" onClick={toggle} aria-pressed={dipilih} aria-describedby={idStatus}>
        {dipilih ? "Batal bandingkan" : "Bandingkan"}
      </Tombol>
      <p id={idStatus} role="status" aria-live="polite" className={`text-sm ${penuh && pesan ? "text-bahaya" : "text-teks-lembut"}`}>
        {pesan}{" "}
        {pesan && ids.length > 0 && (
          <Link href="/bandingkan" className="font-semibold text-utama underline underline-offset-4">
            Lihat perbandingan ({ids.length}/{MAKS_BANDINGKAN})
          </Link>
        )}
      </p>
    </div>
  );
}
