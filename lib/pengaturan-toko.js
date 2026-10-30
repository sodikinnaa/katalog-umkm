import { toko } from "@/lib/toko";
import { supabasePublik } from "@/lib/supabase/server";

export const POLA_WHATSAPP = /^[1-9][0-9]{7,14}$/;

export function normalisasiNomorWhatsApp(masukan) {
  let angka = String(masukan ?? "").replace(/[^\d]/g, "");
  if (angka.startsWith("0")) angka = `62${angka.slice(1)}`;
  return angka;
}

export function validasiNomorWhatsApp(masukan) {
  const nomor = normalisasiNomorWhatsApp(masukan);
  if (!POLA_WHATSAPP.test(nomor)) {
    return {
      nomor,
      error: "Nomor WhatsApp harus 8 sampai 15 digit, format internasional tanpa + (contoh 6281234567890).",
    };
  }
  return { nomor, error: null };
}

export function tautanAman(masukan, { izinkanRelatif = true } = {}) {
  const teks = String(masukan ?? "").trim();
  if (!teks) return null;
  if (teks.length > 2048) return null;
  if (izinkanRelatif && teks.startsWith("/") && !teks.startsWith("//")) return teks;
  try {
    const url = new URL(teks);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.href;
  } catch {
    return null;
  }
}

export function bacaPengaturanDariBaris(baris) {
  if (!baris) return { ...toko, dariDatabase: false };
  return {
    nama: baris.nama || toko.nama,
    tagline: baris.tagline ?? toko.tagline,
    nomorWhatsApp: baris.nomor_whatsapp || toko.nomorWhatsApp,
    alamat: baris.alamat || toko.alamat,
    jamBuka: baris.jam_buka || toko.jamBuka,
    dariDatabase: true,
  };
}

export async function ambilPengaturanToko() {
  try {
    const { data, error } = await supabasePublik()
      .from("pengaturan_toko")
      .select("nama, tagline, nomor_whatsapp, alamat, jam_buka")
      .eq("id", 1)
      .maybeSingle();
    if (error) {
      console.error(`Gagal membaca pengaturan_toko, memakai lib/toko.js: ${error.message}`);
      return { ...toko, dariDatabase: false };
    }
    return bacaPengaturanDariBaris(data);
  } catch (e) {
    console.error(`Gagal membaca pengaturan_toko, memakai lib/toko.js: ${e?.message ?? e}`);
    return { ...toko, dariDatabase: false };
  }
}

export async function ambilBannerAktif() {
  try {
    const { data, error } = await supabasePublik()
      .from("banner")
      .select("id, judul, teks, gambar_url, tautan")
      .eq("aktif", true)
      .order("urutan", { ascending: true })
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error(`Gagal membaca banner: ${error.message}`);
      return null;
    }
    if (!data) return null;
    return {
      ...data,
      gambar_url: tautanAman(data.gambar_url),
      tautan: tautanAman(data.tautan),
    };
  } catch (e) {
    console.error(`Gagal membaca banner: ${e?.message ?? e}`);
    return null;
  }
}
