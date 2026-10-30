import BannerPromo from "@/components/BannerPromo";
import FilterKatalog from "@/components/FilterKatalog";
import KartuProduk from "@/components/KartuProduk";
import KatalogTersimpan from "@/components/KatalogTersimpan";
import Paginasi from "@/components/Paginasi";
import { supabasePublik } from "@/lib/supabase/server";
import { pesanMigrasi } from "@/lib/produk";
import { ambilPengaturanToko } from "@/lib/pengaturan-toko";

export const dynamic = "force-dynamic";

const PER_HALAMAN = 12;

const URUTAN = {
  terbaru: { kolom: "created_at", ascending: false },
  termurah: { kolom: "harga", ascending: true },
  termahal: { kolom: "harga", ascending: false },
};

function ambilTeks(nilai) {
  return (Array.isArray(nilai) ? nilai[0] : nilai ?? "").trim().slice(0, 100);
}

function terapkanFilter(query, q, kategori) {
  if (q) query = query.ilike("nama", `%${q.replace(/[\\%_,]/g, "\\$&")}%`);
  if (kategori) query = query.eq("kategori", kategori);
  return query;
}

export default async function HalamanKatalog({ searchParams }) {
  const params = await searchParams;
  const q = ambilTeks(params.q);
  const kategori = ambilTeks(params.kategori);
  const urut = URUTAN[ambilTeks(params.urut)] ? ambilTeks(params.urut) : "terbaru";
  const halamanDiminta = Math.max(1, Number.parseInt(ambilTeks(params.halaman), 10) || 1);
  const supabase = supabasePublik();
  const toko = await ambilPengaturanToko();

  const [hasilKategori, hasilJumlah] = await Promise.all([
    supabase.from("kategori").select("nama").order("nama"),
    terapkanFilter(supabase.from("produk").select("id", { count: "exact", head: true }).eq("aktif", true), q, kategori),
  ]);

  const galat = pesanMigrasi(hasilKategori.error || hasilJumlah.error);
  if (galat) {
    return <p role="alert" className="my-10 rounded-lg border border-garis bg-permukaan px-4 py-6 text-center text-bahaya">{galat}</p>;
  }

  const daftarKategori = hasilKategori.data.map((baris) => baris.nama);
  const totalProduk = hasilJumlah.count ?? 0;
  const jumlahHalaman = Math.max(1, Math.ceil(totalProduk / PER_HALAMAN));
  const halaman = Math.min(halamanDiminta, jumlahHalaman);
  const awal = (halaman - 1) * PER_HALAMAN;
  const { kolom, ascending } = URUTAN[urut];

  let daftarProduk = [];
  if (totalProduk > 0) {
    const hasil = await terapkanFilter(supabase.from("produk").select("id, nama, harga, harga_diskon, foto_url, kategori, stok, badge, aktif, urutan").eq("aktif", true), q, kategori)
      .order(urut === "terbaru" ? "urutan" : kolom, { ascending: urut === "terbaru" ? true : ascending })
      .order(urut === "terbaru" ? "created_at" : "urutan", { ascending: urut === "terbaru" ? false : true })
      .order("id", { ascending: true })
      .range(awal, awal + PER_HALAMAN - 1);

    const galatDaftar = pesanMigrasi(hasil.error);
    if (galatDaftar) {
      return <p role="alert" className="my-10 rounded-lg border border-garis bg-permukaan px-4 py-6 text-center text-bahaya">{galatDaftar}</p>;
    }
    daftarProduk = hasil.data;
  }

  const adaFilter = Boolean(q || kategori);

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <BannerPromo />
      <KatalogTersimpan mode="ringkasan" />

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>
        <FilterKatalog q={q} kategori={kategori} urut={urut} daftarKategori={daftarKategori} />
        {daftarProduk.length === 0 ? (
          <p className="rounded-lg border border-garis bg-permukaan px-4 py-6 text-center text-teks-lembut">
            {adaFilter
              ? "Tidak ada produk yang cocok. Coba kata kunci atau kategori lain."
              : "Belum ada produk. Silakan kembali lagi nanti."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
        <Paginasi halaman={halaman} jumlahHalaman={jumlahHalaman} searchParams={{ q, kategori, urut }} />
      </section>
    </>
  );
}
