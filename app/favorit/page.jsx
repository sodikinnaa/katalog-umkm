import KatalogTersimpan from "@/components/KatalogTersimpan";

export const metadata = { title: "Produk favorit" };

export default function HalamanFavorit() {
  return (
    <section className="flex flex-col gap-5 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Produk favorit</h1>
      <p className="max-w-prose text-teks-lembut">Produk yang kamu tandai tersimpan di browser ini.</p>
      <KatalogTersimpan mode="favorit" />
    </section>
  );
}
