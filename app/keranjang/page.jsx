import { IsiKeranjang } from "@/components/PengelolaPilihanProduk";

export const metadata = { title: "Keranjang" };

export default function HalamanKeranjang() {
  return (
    <section className="flex flex-col gap-5 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Keranjang</h1>
      <p className="max-w-prose text-teks-lembut">Atur jumlah produk, lalu kirim seluruh pesanan dalam satu pesan WhatsApp.</p>
      <IsiKeranjang />
    </section>
  );
}
