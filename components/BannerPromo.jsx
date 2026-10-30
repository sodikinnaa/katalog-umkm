import Link from "next/link";
import { ambilBannerAktif, tautanAman } from "@/lib/pengaturan-toko";

function IsiBanner({ banner }) {
  return (
    <>
      {banner.gambar_url && (
        <img
          src={banner.gambar_url}
          alt=""
          className="aspect-[16/7] w-full bg-permukaan object-cover sm:aspect-[3/1]"
        />
      )}
      <div className="flex flex-col gap-1 p-5 sm:p-6">
        <h2 className="text-xl font-extrabold sm:text-2xl">{banner.judul}</h2>
        {banner.teks && <p className="max-w-prose text-sm text-teks-lembut sm:text-base">{banner.teks}</p>}
        {banner.tautan && <span className="mt-2 self-start font-semibold text-utama">Lihat promo</span>}
      </div>
    </>
  );
}

export function BannerPromoTampilan({ banner }) {
  if (!banner?.judul) return null;
  const tautan = tautanAman(banner.tautan);
  const kelas = "block overflow-hidden rounded-2xl border border-garis bg-latar hover:border-utama";

  if (!tautan) {
    return (
      <section aria-label="Promo" className={kelas}>
        <IsiBanner banner={{ ...banner, tautan: null }} />
      </section>
    );
  }

  if (tautan.startsWith("/")) {
    return (
      <Link href={tautan} aria-label={`Promo: ${banner.judul}`} className={kelas}>
        <IsiBanner banner={{ ...banner, tautan }} />
      </Link>
    );
  }

  return (
    <a href={tautan} target="_blank" rel="noopener noreferrer" aria-label={`Promo: ${banner.judul}`} className={kelas}>
      <IsiBanner banner={{ ...banner, tautan }} />
    </a>
  );
}

export default async function BannerPromo() {
  const banner = await ambilBannerAktif();
  return <BannerPromoTampilan banner={banner} />;
}
