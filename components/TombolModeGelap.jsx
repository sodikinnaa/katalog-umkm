"use client";

import { useEffect, useState } from "react";

function temaAwal() {
  try {
    const tersimpan = localStorage.getItem("tema");
    if (tersimpan === "dark" || tersimpan === "light") return tersimpan;
  } catch {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function TombolModeGelap() {
  const [tema, setTema] = useState(null);

  useEffect(() => {
    const awal = temaAwal();
    document.documentElement.dataset.theme = awal;
    setTema(awal);
  }, []);

  function ganti() {
    const baru = tema === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = baru;
    localStorage.setItem("tema", baru);
    setTema(baru);
  }

  const gelap = tema === "dark";

  return (
    <button
      type="button"
      onClick={ganti}
      aria-label={gelap ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={gelap ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-garis bg-latar text-teks transition-colors hover:border-utama hover:text-utama"
    >
      {gelap ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      )}
    </button>
  );
}
