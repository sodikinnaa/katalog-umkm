"use client";

import { useId, useState } from "react";
import Link from "next/link";
import Tombol from "@/components/Tombol";
import { tambahKeKeranjang } from "@/components/PengelolaPilihanProduk";

export default function TombolKeranjang({ produk }) {
  const [hasil, setHasil] = useState(null);
  const idStatus = useId();

  return (
    <div className="flex flex-col items-start gap-2">
      <Tombol type="button" varian="garis" onClick={() => setHasil(tambahKeKeranjang(produk))} aria-describedby={idStatus}>
        Tambah ke keranjang
      </Tombol>
      <p id={idStatus} role="status" aria-live="polite" className={`text-sm ${hasil && !hasil.ok ? "text-bahaya" : "text-teks-lembut"}`}>
        {hasil?.pesan}{" "}
        {hasil?.ok && (
          <Link href="/keranjang" className="font-semibold text-utama underline underline-offset-4">
            Lihat keranjang
          </Link>
        )}
      </p>
    </div>
  );
}
