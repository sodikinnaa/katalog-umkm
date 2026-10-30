import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";

export const KOLOM_VARIAN = "id, produk_id, nama, harga, stok, aktif, urutan";

function angkaBulat(nilai, min) {
  const teks = String(nilai ?? "").trim();
  if (!/^\d+$/.test(teks)) return null;
  const angka = Number(teks);
  return Number.isSafeInteger(angka) && angka >= min ? angka : null;
}

export function bacaIdPositif(nilai) {
  return angkaBulat(nilai, 1);
}

export function bacaVarian(formData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const harga = angkaBulat(formData.get("harga"), 1);
  const stok = angkaBulat(formData.get("stok"), 0);
  const urutan = angkaBulat(formData.get("urutan") || "0", 0);
  const aktif = formData.get("aktif") === "on";

  let galat = null;
  if (!nama || nama.length > 100) galat = "nama";
  else if (harga === null) galat = "harga";
  else if (stok === null) galat = "stok";
  else if (urutan === null) galat = "urutan";

  return { galat, data: { nama, harga, stok, urutan, aktif } };
}

export async function ambilVarianAktif(supabase, produkId) {
  const { data, error } = await supabase
    .from("varian_produk")
    .select(KOLOM_VARIAN)
    .eq("produk_id", produkId)
    .eq("aktif", true)
    .order("urutan", { ascending: true })
    .order("id", { ascending: true });
  return error ? [] : data;
}

export function teksPesanVarian({ produk, varian, jumlah }) {
  const harga = varian ? varian.harga : produk.harga;
  const namaLengkap = varian ? `${produk.nama} (varian ${varian.nama})` : produk.nama;
  return `Halo, saya ingin memesan ${namaLengkap} sebanyak ${jumlah} pcs dengan harga ${formatRupiah(harga)} per pcs. Total ${formatRupiah(harga * jumlah)}.`;
}

export function tautanWhatsApp(pesan, nomor) {
  return `https://wa.me/${nomor || toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;
}

export function catatKlikWhatsApp(produkId) {
  if (typeof window === "undefined" || !produkId) return;
  const body = JSON.stringify({ produk_id: produkId });
  try {
    if (navigator.sendBeacon?.("/api/whatsapp/klik", new Blob([body], { type: "application/json" }))) return;
    fetch("/api/whatsapp/klik", { method: "POST", keepalive: true, headers: { "Content-Type": "application/json" }, body }).catch(() => {});
  } catch {}
}
