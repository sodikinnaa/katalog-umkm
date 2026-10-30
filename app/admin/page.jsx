import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import ProdukTerlaris from "@/components/ProdukTerlaris";
import Tombol from "@/components/Tombol";
import { supabaseSesi } from "@/lib/supabase/server";
import { pesanMigrasi } from "@/lib/produk";

export const dynamic = "force-dynamic";

const PER_HALAMAN = 20;

function polaCari(teks) {
  return `%${teks.replace(/[\\%,_]/g, (c) => `\\${c}`)}%`;
}

function tautan(q, halaman) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (halaman > 1) p.set("halaman", String(halaman));
  const s = p.toString();
  return s ? `/admin?${s}` : "/admin";
}

export default async function HalamanAdmin({ searchParams }) {
  const sp = await searchParams;
  const q = (typeof sp?.q === "string" ? sp.q : "").trim().slice(0, 100);
  const halaman = Math.max(1, Number.parseInt(sp?.halaman, 10) || 1);
  const dari = (halaman - 1) * PER_HALAMAN;

  const supabase = await supabaseSesi();

  let query = supabase
    .from("produk")
    .select("id, nama, harga, harga_diskon, foto_url, kategori, stok, badge, aktif, urutan", { count: "exact" })
    .order("urutan", { ascending: true })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(dari, dari + PER_HALAMAN - 1);
  if (q) query = query.ilike("nama", polaCari(q));

  const [daftar, ringkasan] = await Promise.all([query, supabase.from("produk").select("kategori")]);

  const galat = pesanMigrasi((daftar.error?.code !== "PGRST103" && daftar.error) || ringkasan.error);
  if (galat) {
    return (
      <div className="flex flex-col gap-6 py-8">
        <NavAdmin />
        <p role="alert" className="rounded-2xl border border-garis bg-permukaan p-6 font-semibold text-bahaya">{galat}</p>
      </div>
    );
  }
  const status = typeof sp?.status === "string" ? sp.status : "";

  const daftarProduk = daftar.error ? [] : daftar.data || [];
  const jumlahHasil = daftar.count ?? 0;
  const totalHalaman = Math.max(1, Math.ceil(jumlahHasil / PER_HALAMAN));

  const semua = ringkasan.data || [];
  const perKategori = Object.entries(
    semua.reduce((acc, { kategori }) => {
      const k = kategori || "Tanpa kategori";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      <section aria-labelledby="judul-ringkasan" className="flex flex-col gap-3">
        <h2 id="judul-ringkasan" className="text-lg font-extrabold">
          Ringkasan
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-garis bg-permukaan p-4">
            <p className="text-sm text-teks-lembut">Total produk</p>
            <p className="text-3xl font-extrabold text-utama">{semua.length}</p>
          </div>
          {perKategori.map(([kategori, jumlah]) => (
            <div key={kategori} className="rounded-2xl border border-garis p-4">
              <p className="truncate text-sm text-teks-lembut">{kategori}</p>
              <p className="text-2xl font-extrabold">{jumlah}</p>
            </div>
          ))}
        </div>
      </section>

      <ProdukTerlaris />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <div className="flex flex-wrap gap-2">
          <Tombol href="/admin/kategori" varian="garis">Kelola kategori</Tombol>
          <a
            href="/admin/ekspor"
            download
            className="inline-flex items-center justify-center rounded-lg border border-garis bg-latar px-4 py-2.5 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
          >
            Ekspor CSV
          </a>
          <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
        </div>
      </div>

      {status.startsWith("gagal") && (
        <p role="alert" className="rounded-2xl border border-garis bg-permukaan p-4 text-sm font-semibold text-bahaya">
          Aksi gagal dijalankan. Pastikan migrasi 001 sampai 003 sudah diterapkan, lalu coba lagi.
        </p>
      )}

      <form method="get" action="/admin" role="search" className="flex flex-wrap items-end gap-2">
        <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm font-semibold">
          Cari nama produk
          <input
            type="search"
            name="q"
            defaultValue={q}
            maxLength={100}
            placeholder="Contoh: keripik"
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
        </label>
        <Tombol type="submit">Cari</Tombol>
        {q && (
          <Tombol href="/admin" varian="garis">
            Reset
          </Tombol>
        )}
      </form>

      {daftarProduk.length === 0 ? (
        <p className="rounded-2xl border border-garis bg-permukaan p-6 text-teks-lembut">
          {q ? `Tidak ada produk dengan nama "${q}".` : "Belum ada produk. Tambahkan produk pertama."}
        </p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}

      <nav aria-label="Paginasi" className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-teks-lembut">
          {jumlahHasil} produk · halaman {Math.min(halaman, totalHalaman)} dari {totalHalaman}
        </p>
        <div className="flex gap-2">
          {halaman > 1 && (
            <Tombol href={tautan(q, Math.min(halaman - 1, totalHalaman))} varian="garis">
              Sebelumnya
            </Tombol>
          )}
          {halaman < totalHalaman && (
            <Tombol href={tautan(q, halaman + 1)} varian="garis">
              Berikutnya
            </Tombol>
          )}
        </div>
      </nav>
    </div>
  );
}
