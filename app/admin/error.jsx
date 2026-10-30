"use client";

import Link from "next/link";

export default function AdminError({ reset }) {
  return (
    <div className="my-16 rounded-2xl border border-garis bg-permukaan p-6">
      <h1 className="text-2xl font-extrabold text-bahaya">Terjadi kesalahan</h1>
      <p className="mt-2 text-teks-lembut">Terjadi kesalahan. Silakan coba lagi.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="rounded-lg bg-utama px-4 py-2.5 text-sm font-semibold text-white hover:bg-utama-gelap" onClick={reset} type="button">
          Coba lagi
        </button>
        <Link className="rounded-lg border border-garis bg-latar px-4 py-2.5 text-sm font-semibold text-teks hover:border-utama hover:text-utama" href="/admin">
          Kembali ke admin
        </Link>
      </div>
    </div>
  );
}
