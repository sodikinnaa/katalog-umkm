"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TombolModeGelap from "@/components/TombolModeGelap";

const TAUTAN = [
  { href: "/", label: "Katalog" },
  { href: "/keranjang", label: "Keranjang" },
  { href: "/bandingkan", label: "Bandingkan" },
  { href: "/favorit", label: "Favorit" },
  { href: "/tentang", label: "Tentang toko" },
];

export default function NavigasiUtama() {
  const [buka, setBuka] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setBuka(false);
  }, [pathname]);

  useEffect(() => {
    if (!buka) return;
    function padaKeydown(e) {
      if (e.key === "Escape") setBuka(false);
    }
    window.addEventListener("keydown", padaKeydown);
    return () => window.removeEventListener("keydown", padaKeydown);
  }, [buka]);

  return (
    <div className="flex items-center gap-2">
      <nav className="hidden items-center gap-3 text-sm font-semibold md:flex" aria-label="Navigasi utama desktop">
        <Link href="/keranjang" className="hover:text-utama">
          Keranjang
        </Link>
        <Link href="/bandingkan" className="hover:text-utama">
          Bandingkan
        </Link>
        <Link href="/favorit" className="hover:text-utama">
          Favorit
        </Link>
        <TombolModeGelap />
      </nav>

      <div className="flex items-center gap-2 md:hidden">
        <TombolModeGelap />
        <button
          type="button"
          onClick={() => setBuka((v) => !v)}
          aria-expanded={buka}
          aria-controls="menu-mobile"
          aria-label={buka ? "Tutup menu navigasi" : "Buka menu navigasi"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-garis bg-latar text-teks hover:border-utama hover:text-utama focus:outline-none focus:ring-2 focus:ring-utama"
        >
          {buka ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          )}
        </button>
      </div>

      {buka && (
        <>
          <div
            onClick={() => setBuka(false)}
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
          />
          <nav
            id="menu-mobile"
            aria-label="Navigasi mobile"
            className="fixed inset-x-0 top-[65px] z-50 flex flex-col divide-y divide-garis border-b border-garis bg-latar p-4 shadow-xl md:hidden"
          >
            {TAUTAN.map((item) => {
              const aktif = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setBuka(false)}
                  className={`py-3 text-base font-semibold transition-colors ${
                    aktif ? "text-utama" : "text-teks hover:text-utama"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-3">
              <Link
                href="/admin"
                onClick={() => setBuka(false)}
                className="block text-sm text-teks-lembut hover:text-utama"
              >
                Masuk sebagai admin →
              </Link>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
