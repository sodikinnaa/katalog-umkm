import { supabasePublik } from "@/lib/supabase/server";
import { FOTO_CADANGAN } from "@/lib/produk-util";

export { FOTO_CADANGAN, hargaProduk, produkHabis } from "@/lib/produk-util";
export const KOLOM_PRODUK_PUBLIK =
  "id, nama, harga, harga_diskon, deskripsi, foto_url, kategori, stok, badge, aktif, urutan, created_at";

export function pesanMigrasi(error, nomor = "001, 002, dan 003") {
  if (!error) return null;
  console.error("Supabase:", error.message);
  return `Fitur katalog belum siap. Jalankan migrasi ${nomor} melalui Supabase SQL Editor.`;
}

export function urlFotoStorage(storagePath) {
  if (!storagePath) return null;
  return supabasePublik().storage.from("produk").getPublicUrl(storagePath).data.publicUrl;
}

export function daftarFotoProduk(produk, foto = []) {
  const daftar = foto.map((item) => ({
    ...item,
    url: item.url || urlFotoStorage(item.storage_path),
  }));
  const utama = produk?.foto_url || daftar[0]?.url || FOTO_CADANGAN;
  if (!daftar.some((item) => item.url === utama)) {
    daftar.unshift({ id: `utama-${produk?.id ?? "produk"}`, url: utama, alt_text: produk?.nama });
  }
  return daftar;
}

export async function ambilProdukPublik(id) {
  const supabase = supabasePublik();
  const { data: produk, error } = await supabase
    .from("produk")
    .select(KOLOM_PRODUK_PUBLIK)
    .eq("id", id)
    .eq("aktif", true)
    .maybeSingle();
  if (error || !produk) return { produk: null, foto: [], error };

  const hasilFoto = await supabase
    .from("foto_produk")
    .select("id, storage_path, alt_text, urutan")
    .eq("produk_id", produk.id)
    .order("urutan", { ascending: true })
    .order("id", { ascending: true });

  return {
    produk,
    foto: hasilFoto.error ? [] : daftarFotoProduk(produk, hasilFoto.data),
    error: hasilFoto.error,
  };
}
