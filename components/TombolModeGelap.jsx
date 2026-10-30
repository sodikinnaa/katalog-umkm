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
      className="inline-flex items-center gap-2 rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
    >
      {gelap ? "Terang" : "Gelap"}
    </button>
  );
}
