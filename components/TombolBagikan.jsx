"use client";

import { useState } from "react";
import Tombol from "@/components/Tombol";

export default function TombolBagikan({ nama }) {
  const [pesan, setPesan] = useState("");

  async function bagikan() {
    setPesan("");

    try {
      if (navigator.share) {
        await navigator.share({ title: nama, url: location.href });
        setPesan("Link dibagikan");
        return;
      }

      await navigator.clipboard.writeText(location.href);
      setPesan("Link tersalin");
    } catch (error) {
      if (error.name !== "AbortError") {
        setPesan("Link gagal dibagikan. Salin alamat halaman dari browser.");
      }
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Tombol type="button" varian="garis" onClick={bagikan} aria-describedby="status-bagikan">
        Bagikan produk
      </Tombol>
      <p id="status-bagikan" role="status" aria-live="polite" className="text-sm text-teks-lembut">
        {pesan}
      </p>
    </div>
  );
}
