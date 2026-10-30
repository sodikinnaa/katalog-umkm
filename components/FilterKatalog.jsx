import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

export default function FilterKatalog({ q, kategori, urut, daftarKategori }) {
  const kelasSelect =
    "w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none";

  return (
    <form method="GET" className="grid gap-4 rounded-xl border border-garis bg-permukaan p-4 md:grid-cols-3">
      <Input label="Cari produk" name="q" defaultValue={q} placeholder="Nama produk" />
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Kategori
        <select name="kategori" defaultValue={kategori} className={kelasSelect}>
          <option value="">Semua kategori</option>
          {daftarKategori.map((namaKategori) => (
            <option key={namaKategori} value={namaKategori}>
              {namaKategori}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Urutkan
        <select name="urut" defaultValue={urut} className={kelasSelect}>
          <option value="terbaru">Terbaru</option>
          <option value="termurah">Termurah</option>
          <option value="termahal">Termahal</option>
        </select>
      </label>
      <div className="flex gap-3 md:col-span-3">
        <Tombol type="submit">Terapkan</Tombol>
        <Tombol href="/" varian="garis">
          Atur ulang
        </Tombol>
      </div>
    </form>
  );
}
