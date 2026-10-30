import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { supabasePublik } from "@/lib/supabase/server";
import { kirimUlasan } from "@/app/produk/[id]/ulasan-actions";

const pesanStatus = {
  berhasil: "Ulasan berhasil dikirim.",
  nama: "Nama wajib diisi dan maksimal 60 karakter.",
  rating: "Pilih rating dari 1 sampai 5.",
  komentar: "Komentar wajib diisi dan maksimal 1.000 karakter.",
  "terlalu-sering": "Terlalu banyak ulasan dikirim. Coba lagi satu jam lagi.",
  gagal: "Ulasan gagal disimpan. Silakan coba lagi.",
  "tidak-valid": "Produk tidak valid.",
};

export default async function UlasanProduk({ produkId, status }) {
  const supabase = supabasePublik();
  const [{ data: ulasan, error }, { data: ringkasan }] = await Promise.all([
    supabase
      .from("ulasan")
      .select("id, nama, rating, komentar, created_at")
      .eq("produk_id", produkId)
      .eq("tampil", true)
      .order("created_at", { ascending: false }),
    supabase.from("ringkasan_rating").select("jumlah, rata_rata").eq("produk_id", produkId).maybeSingle(),
  ]);

  if (error) {
    console.error("Ulasan:", error.message);
    return null;
  }

  return (
    <section id="ulasan" aria-labelledby="judul-ulasan" className="flex flex-col gap-6 py-8">
      <div>
        <h2 id="judul-ulasan" className="text-2xl font-extrabold">Ulasan pembeli</h2>
        <p className="mt-1 text-sm text-teks-lembut">
          {ringkasan ? `${ringkasan.rata_rata} dari 5 (${ringkasan.jumlah} ulasan)` : "Belum ada rating."}
        </p>
      </div>

      <form action={kirimUlasan.bind(null, produkId)} className="flex max-w-xl flex-col gap-4 rounded-2xl border border-garis p-5">
        <h3 className="text-lg font-bold">Tulis ulasan</h3>
        {status && pesanStatus[status] && (
          <p className={status === "berhasil" ? "text-sm text-utama" : "text-sm text-bahaya"} role="status">
            {pesanStatus[status]}
          </p>
        )}
        <Input label="Nama" name="nama" required maxLength={60} autoComplete="name" />
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Rating
          <select name="rating" required defaultValue="" className="rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none">
            <option value="" disabled>Pilih rating</option>
            {[5, 4, 3, 2, 1].map((nilai) => <option key={nilai} value={nilai}>{nilai} bintang</option>)}
          </select>
        </label>
        <Input label="Komentar" name="komentar" textarea required minLength={1} maxLength={1000} />
        <label className="hidden" aria-hidden="true">
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
        <Tombol type="submit" className="self-start">Kirim ulasan</Tombol>
      </form>

      {ulasan.length === 0 ? (
        <p className="rounded-2xl border border-garis bg-permukaan p-6 text-teks-lembut">Belum ada ulasan. Jadilah yang pertama memberi ulasan.</p>
      ) : (
        <div className="grid gap-4">
          {ulasan.map((item) => (
            <article key={item.id} className="rounded-2xl border border-garis p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold">{item.nama}</h3>
                <p className="text-sm font-semibold text-harga" aria-label={`${item.rating} dari 5 bintang`}>{item.rating}/5</p>
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-teks-lembut">{item.komentar}</p>
              <time className="mt-3 block text-xs text-teks-lembut" dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString("id-ID")}</time>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
