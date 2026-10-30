export const FOTO_CADANGAN = "/produk/kopi.svg";

export function hargaProduk(produk) {
  return produk.harga_diskon ?? produk.harga;
}

export function produkHabis(produk) {
  return produk.stok != null && Number(produk.stok) <= 0;
}
