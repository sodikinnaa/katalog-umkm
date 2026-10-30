"use server";

import { revalidatePath } from "next/cache";
import { supabaseSesi } from "@/lib/supabase/server";

const MAKS_BYTE = 1024 * 1024;
const MAKS_BARIS = 500;
const MAKS_HARGA = 2147483647;
const KOLOM_WAJIB = ["nama", "harga"];
const KOLOM_OPSIONAL = ["kategori", "deskripsi", "foto_url"];

function uraiCsv(teks) {
  const rekaman = [];
  let sel = "";
  let baris = [];
  let dalamKutip = false;
  let i = 0;
  if (teks.charCodeAt(0) === 0xfeff) i = 1;

  for (; i < teks.length; i++) {
    const c = teks[i];
    if (dalamKutip) {
      if (c === '"') {
        if (teks[i + 1] === '"') {
          sel += '"';
          i++;
        } else {
          dalamKutip = false;
        }
      } else {
        sel += c;
      }
    } else if (c === '"' && sel === "") {
      dalamKutip = true;
    } else if (c === ",") {
      baris.push(sel);
      sel = "";
    } else if (c === "\r" || c === "\n") {
      if (c === "\r" && teks[i + 1] === "\n") i++;
      baris.push(sel);
      rekaman.push(baris);
      baris = [];
      sel = "";
    } else {
      sel += c;
    }
  }

  if (dalamKutip) return { error: "Ada tanda kutip (\") yang tidak ditutup. Periksa isi file CSV." };
  if (sel !== "" || baris.length > 0) {
    baris.push(sel);
    rekaman.push(baris);
  }
  return { rekaman };
}

function validasiCsv(teks) {
  const { rekaman, error } = uraiCsv(teks);
  if (error) return { error };

  const kosong = (r) => r.every((s) => s.trim() === "");
  if (rekaman.length === 0 || kosong(rekaman[0])) return { error: "File CSV kosong. Baris pertama harus berisi header." };

  const header = rekaman[0].map((h) => h.trim().toLowerCase());
  const kurang = KOLOM_WAJIB.filter((k) => !header.includes(k));
  if (kurang.length > 0) return { error: `Header wajib tidak ada: ${kurang.join(", ")}. Baris pertama harus memuat nama dan harga.` };
  const ganda = header.filter((h, i) => h && header.indexOf(h) !== i);
  if (ganda.length > 0) return { error: `Header ganda: ${[...new Set(ganda)].join(", ")}. Setiap kolom hanya boleh muncul sekali.` };

  const data = rekaman.map((sel, i) => ({ nomor: i + 1, sel })).slice(1).filter((r) => !kosong(r.sel));
  if (data.length === 0) return { error: "Tidak ada baris produk di bawah header." };
  if (data.length > MAKS_BARIS) return { error: `File berisi ${data.length} baris produk. Maksimal ${MAKS_BARIS} baris per impor; pecah menjadi beberapa file.` };

  const posisi = Object.fromEntries([...KOLOM_WAJIB, ...KOLOM_OPSIONAL].map((k) => [k, header.indexOf(k)]));
  const ambil = (sel, k) => (posisi[k] >= 0 ? (sel[posisi[k]] ?? "").trim() : "");
  const valid = [];
  const gagal = [];

  for (const { nomor, sel } of data) {
    if (sel.length > header.length) {
      gagal.push({ baris: nomor, alasan: `Jumlah kolom (${sel.length}) melebihi header (${header.length}). Bungkus teks yang berisi koma dengan tanda kutip.` });
      continue;
    }
    const nama = ambil(sel, "nama");
    const hargaTeks = ambil(sel, "harga");
    const fotoUrl = ambil(sel, "foto_url");
    const alasan = [];

    if (!nama) alasan.push("nama wajib diisi");
    if (!hargaTeks) alasan.push("harga wajib diisi");
    else if (!/^\d+$/.test(hargaTeks) || Number(hargaTeks) <= 0 || Number(hargaTeks) > MAKS_HARGA)
      alasan.push(`harga "${hargaTeks.slice(0, 30)}" harus angka bulat positif tanpa titik, koma, atau "Rp"`);
    if (fotoUrl && !/^(https?:\/\/|\/)/i.test(fotoUrl)) alasan.push("foto_url harus diawali https://, http://, atau /");

    if (alasan.length > 0) {
      gagal.push({ baris: nomor, alasan: alasan.join("; ") });
      continue;
    }
    valid.push({
      nama,
      harga: Number(hargaTeks),
      kategori: ambil(sel, "kategori") || null,
      deskripsi: ambil(sel, "deskripsi") || null,
      foto_url: fotoUrl || "/produk/kopi.svg",
    });
  }

  return { valid, gagal };
}

export async function imporCsv(_state, formData) {
  const supabase = await supabaseSesi();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { errors: { form: "Akses ditolak. Silakan masuk sebagai admin terlebih dahulu." } };
  }

  const file = formData.get("file");
  const namaFile = typeof file?.name === "string" ? file.name : "";
  const tolak = (pesan) => ({ errors: { form: pesan }, namaFile });

  if (!file || typeof file.text !== "function" || file.size === 0) return tolak("Pilih file CSV terlebih dahulu.");
  if (!/\.csv$/i.test(namaFile)) return tolak("File harus berformat .csv.");
  if (file.size > MAKS_BYTE) return tolak("Ukuran file melebihi 1 MB. Pecah menjadi beberapa file.");

  const hasil = validasiCsv(await file.text());
  if (hasil.error) return tolak(hasil.error);

  const { valid, gagal } = hasil;
  if (valid.length > 0) {
    const { error } = await supabase.from("produk").insert(valid);
    if (error) {
      return {
        errors: { form: "Penyimpanan ke database gagal, tidak ada produk yang tersimpan. Silakan coba lagi." },
        namaFile,
        ringkasan: { berhasil: 0, gagal: valid.length + gagal.length },
        gagal,
      };
    }
    revalidatePath("/");
    revalidatePath("/admin");
  }

  return { errors: {}, namaFile, ringkasan: { berhasil: valid.length, gagal: gagal.length }, gagal };
}
