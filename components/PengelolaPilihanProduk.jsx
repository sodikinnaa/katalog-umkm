"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Tombol from "@/components/Tombol";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";

export const KUNCI_KERANJANG = "keranjang";
export const KUNCI_BANDINGKAN = "produk-bandingkan";
export const MAKS_BANDINGKAN = 2;
export const MAKS_JUMLAH = 99;
const MAKS_ITEM_KERANJANG = 50;
const EVENT = "pilihan-produk-berubah";

function idValid(id) {
  const teks = String(id ?? "");
  return /^\d{1,18}$/.test(teks) ? teks : null;
}

function teksAman(nilai, maks) {
  return typeof nilai === "string" ? nilai.trim().slice(0, maks) : "";
}

function fotoAman(url) {
  const teks = teksAman(url, 2000);
  return teks.startsWith("/") || /^https?:\/\//i.test(teks) ? teks : "";
}

export function batasiJumlah(angka) {
  const n = Math.floor(Number(angka));
  return Number.isFinite(n) ? Math.min(MAKS_JUMLAH, Math.max(1, n)) : 1;
}

function bersihkanItem(item) {
  if (!item || typeof item !== "object") return null;
  const id = idValid(item.id);
  const nama = teksAman(item.nama, 200);
  const harga = Number(item.harga);
  if (!id || !nama || !Number.isSafeInteger(harga) || harga < 0) return null;
  return {
    id,
    nama,
    harga,
    foto_url: fotoAman(item.foto_url),
    kategori: teksAman(item.kategori, 100),
    jumlah: batasiJumlah(item.jumlah),
  };
}

function bacaJson(kunci) {
  try {
    const data = JSON.parse(localStorage.getItem(kunci) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function simpan(kunci, data) {
  try {
    localStorage.setItem(kunci, JSON.stringify(data));
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(EVENT));
  return true;
}

export function bacaKeranjang() {
  const hasil = [];
  for (const item of bacaJson(KUNCI_KERANJANG)) {
    const bersih = bersihkanItem(item);
    if (bersih && !hasil.some((x) => x.id === bersih.id)) hasil.push(bersih);
  }
  return hasil.slice(0, MAKS_ITEM_KERANJANG);
}

export function simpanKeranjang(daftar) {
  return simpan(KUNCI_KERANJANG, daftar.map(bersihkanItem).filter(Boolean).slice(0, MAKS_ITEM_KERANJANG));
}

export function tambahKeKeranjang(produk) {
  const daftar = bacaKeranjang();
  const id = idValid(produk.id);
  const ada = daftar.find((item) => item.id === id);
  if (ada) {
    ada.jumlah = batasiJumlah(ada.jumlah + 1);
  } else {
    if (daftar.length >= MAKS_ITEM_KERANJANG) return { ok: false, pesan: `Keranjang penuh (maksimal ${MAKS_ITEM_KERANJANG} produk).` };
    const baru = bersihkanItem({ ...produk, jumlah: 1 });
    if (!baru) return { ok: false, pesan: "Produk ini tidak bisa ditambahkan ke keranjang." };
    daftar.push(baru);
  }
  if (!simpanKeranjang(daftar)) return { ok: false, pesan: "Keranjang gagal disimpan. Pastikan penyimpanan browser aktif." };
  const jumlah = daftar.find((item) => item.id === id).jumlah;
  return { ok: true, pesan: `Ditambahkan ke keranjang (${jumlah} pcs).` };
}

export function bacaBandingkan() {
  const hasil = [];
  for (const id of bacaJson(KUNCI_BANDINGKAN)) {
    const bersih = idValid(id);
    if (bersih && !hasil.includes(bersih)) hasil.push(bersih);
  }
  return hasil.slice(0, MAKS_BANDINGKAN);
}

export function simpanBandingkan(ids) {
  return simpan(KUNCI_BANDINGKAN, ids.map(idValid).filter(Boolean).slice(0, MAKS_BANDINGKAN));
}

export function totalKeranjang(daftar) {
  return daftar.reduce((total, item) => total + item.harga * item.jumlah, 0);
}

export function tautanWhatsAppKeranjang(daftar) {
  const baris = daftar.map(
    (item, i) => `${i + 1}. ${item.nama} x ${item.jumlah} @ ${formatRupiah(item.harga)} = ${formatRupiah(item.harga * item.jumlah)}`
  );
  const pesan = ["Halo, saya ingin memesan:", ...baris, `Total: ${formatRupiah(totalKeranjang(daftar))}`].join("\n");
  return `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;
}

export function usePilihan(baca) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const muat = () => setData(baca());
    muat();
    window.addEventListener("storage", muat);
    window.addEventListener(EVENT, muat);
    return () => {
      window.removeEventListener("storage", muat);
      window.removeEventListener(EVENT, muat);
    };
  }, [baca]);
  return data;
}

const kelasTombolJumlah =
  "flex h-11 w-11 items-center justify-center rounded-lg border border-garis text-lg font-bold hover:bg-permukaan disabled:opacity-40";

export function IsiKeranjang() {
  const daftar = usePilihan(bacaKeranjang);

  if (!daftar) return <p className="text-teks-lembut">Memuat keranjang...</p>;

  if (daftar.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-garis bg-permukaan px-4 py-8 text-center">
        <p className="text-teks-lembut">Keranjang masih kosong. Tambahkan produk dari halaman detail produk.</p>
        <Tombol href="/">Lihat katalog</Tombol>
      </div>
    );
  }

  const ubahJumlah = (id, jumlah) =>
    simpanKeranjang(daftar.map((item) => (item.id === id ? { ...item, jumlah: batasiJumlah(jumlah) } : item)));
  const hapus = (id) => simpanKeranjang(daftar.filter((item) => item.id !== id));

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col divide-y divide-garis rounded-2xl border border-garis">
        {daftar.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center gap-4 p-4">
            {item.foto_url && (
              <img src={item.foto_url} alt="" className="h-16 w-16 rounded-lg bg-permukaan object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <a href={`/produk/${item.id}`} className="font-semibold hover:text-utama">
                {item.nama}
              </a>
              <p className="text-sm text-teks-lembut">{formatRupiah(item.harga)} per pcs</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => ubahJumlah(item.id, item.jumlah - 1)}
                disabled={item.jumlah <= 1}
                aria-label={`Kurangi jumlah ${item.nama}`}
                className={kelasTombolJumlah}
              >
                −
              </button>
              <label htmlFor={`jumlah-${item.id}`} className="sr-only">
                Jumlah {item.nama}
              </label>
              <input
                id={`jumlah-${item.id}`}
                type="number"
                inputMode="numeric"
                min={1}
                max={MAKS_JUMLAH}
                value={item.jumlah}
                onChange={(e) => ubahJumlah(item.id, e.target.value)}
                className="h-11 w-16 rounded-lg border border-garis bg-latar text-center font-semibold"
              />
              <button
                type="button"
                onClick={() => ubahJumlah(item.id, item.jumlah + 1)}
                disabled={item.jumlah >= MAKS_JUMLAH}
                aria-label={`Tambah jumlah ${item.nama}`}
                className={kelasTombolJumlah}
              >
                +
              </button>
            </div>
            <p className="w-28 text-right font-bold">{formatRupiah(item.harga * item.jumlah)}</p>
            <Tombol type="button" varian="bahaya" onClick={() => hapus(item.id)} aria-label={`Hapus ${item.nama} dari keranjang`}>
              Hapus
            </Tombol>
          </li>
        ))}
      </ul>
      <p className="text-lg" aria-live="polite">
        Total: <span className="font-extrabold">{formatRupiah(totalKeranjang(daftar))}</span>
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href={tautanWhatsAppKeranjang(daftar)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap"
        >
          Pesan semua via WhatsApp
        </a>
        <Tombol type="button" varian="garis" onClick={() => simpanKeranjang([])}>
          Kosongkan keranjang
        </Tombol>
      </div>
    </div>
  );
}

export function PilihanBandingkan() {
  const router = useRouter();
  const ids = usePilihan(bacaBandingkan);
  const lengkap = ids?.length === MAKS_BANDINGKAN;

  useEffect(() => {
    if (lengkap) router.replace(`/bandingkan?${ids.map((id) => `id=${id}`).join("&")}`);
  }, [lengkap, ids, router]);

  if (!ids || lengkap) return <p className="text-teks-lembut">Memuat perbandingan...</p>;

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-garis bg-permukaan px-4 py-8 text-center">
      <p className="text-teks-lembut">
        {ids.length === 0
          ? "Belum ada produk yang dipilih. Buka halaman produk lalu tekan \"Bandingkan\" pada dua produk."
          : "Baru 1 produk dipilih. Pilih satu produk lagi untuk dibandingkan."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Tombol href="/">Lihat katalog</Tombol>
        {ids.length > 0 && (
          <Tombol type="button" varian="garis" onClick={() => simpanBandingkan([])}>
            Hapus pilihan
          </Tombol>
        )}
      </div>
    </div>
  );
}

export function TombolHapusBandingkan() {
  const router = useRouter();
  return (
    <Tombol
      type="button"
      varian="garis"
      onClick={() => {
        simpanBandingkan([]);
        router.push("/");
      }}
    >
      Hapus pilihan dan kembali ke katalog
    </Tombol>
  );
}
