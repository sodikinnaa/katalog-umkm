"use server";

import { panggilAI, GalatAI } from "@/lib/ai/server";
import { supabaseSesi } from "@/lib/supabase/server";

export async function buatDeskripsiAI(nama, kategori) {
  const supabase = await supabaseSesi();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi admin berakhir. Silakan masuk kembali." };
  }

  const namaBersih = String(nama ?? "").trim();
  const kategoriBersih = String(kategori ?? "").trim();

  if (!namaBersih || !kategoriBersih) {
    return { error: "Isi nama dan kategori produk terlebih dahulu." };
  }
  if (namaBersih.length > 150 || kategoriBersih.length > 100) {
    return { error: "Nama atau kategori produk terlalu panjang." };
  }

  try {
    const deskripsi = await panggilAI({
      messages: [
        {
          role: "system",
          content:
            "Tulis satu paragraf deskripsi katalog UMKM dalam bahasa Indonesia. Gunakan hanya nama dan kategori yang diberikan. Jangan mengarang bahan, ukuran, manfaat, sertifikasi, stok, harga, atau klaim lain. Maksimal 60 kata. Keluarkan deskripsi saja.",
        },
        {
          role: "user",
          content: JSON.stringify({ nama: namaBersih, kategori: kategoriBersih }),
        },
      ],
      maxTokens: 140,
    });
    return { deskripsi };
  } catch (error) {
    return { error: error instanceof GalatAI ? error.message : "Deskripsi gagal dibuat. Silakan coba lagi." };
  }
}
