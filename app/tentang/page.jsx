import { toko } from "@/lib/toko";

export const metadata = {
  title: `Tentang | ${toko.nama}`,
  description: `Profil dan kontak ${toko.nama}`,
};

export default function HalamanTentang() {
  const tautanWhatsApp = `https://wa.me/${toko.nomorWhatsApp}`;

  return (
    <div className="py-10 sm:py-14">
      <section className="max-w-prose">
        <p className="text-sm font-semibold text-utama">Tentang toko</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">{toko.nama}</h1>
        <p className="mt-4 text-lg leading-relaxed text-teks-lembut">{toko.tagline}</p>
      </section>

      <section aria-labelledby="informasi-toko" className="mt-10 rounded-2xl border border-garis bg-permukaan p-6 sm:p-8">
        <h2 id="informasi-toko" className="text-2xl font-extrabold">
          Informasi toko
        </h2>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="font-bold">Alamat</dt>
            <dd className="mt-1 text-teks-lembut">{toko.alamat}</dd>
          </div>
          <div>
            <dt className="font-bold">Jam buka</dt>
            <dd className="mt-1 text-teks-lembut">{toko.jamBuka}</dd>
          </div>
          <div>
            <dt className="font-bold">Kontak</dt>
            <dd className="mt-2">
              <a
                href={tautanWhatsApp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-utama px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-utama-gelap"
              >
                Hubungi via WhatsApp
              </a>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
