"use client";

import { useState, useTransition } from "react";
import { buatDeskripsiAI } from "@/app/admin/ai-actions";
import Tombol from "@/components/Tombol";

export default function TombolDeskripsiAI({ formRef, onHasil }) {
  const [pesan, setPesan] = useState("");
  const [pending, startTransition] = useTransition();

  function buatDeskripsi() {
    const form = formRef.current;
    const nama = form?.elements.namedItem("nama")?.value;
    const kategori = form?.elements.namedItem("kategori")?.value;

    setPesan("");
    startTransition(async () => {
      const hasil = await buatDeskripsiAI(nama, kategori);
      if (hasil.error) {
        setPesan(hasil.error);
        return;
      }
      onHasil(hasil.deskripsi);
      setPesan("Deskripsi berhasil dibuat. Periksa sebelum menyimpan.");
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Tombol type="button" varian="garis" onClick={buatDeskripsi} disabled={pending}>
        {pending ? "Membuat deskripsi..." : "Buat deskripsi dengan AI"}
      </Tombol>
      {pesan && (
        <p role="status" className={`text-sm ${pesan.startsWith("Deskripsi berhasil") ? "text-teks-lembut" : "font-semibold text-bahaya"}`}>
          {pesan}
        </p>
      )}
    </div>
  );
}
