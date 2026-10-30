"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const SAPAAN = "Halo! Saya asisten E-Craf UMKM. Saya bisa membantu mencari produk, mengecek harga dan stok, atau menjelaskan cara pemesanan.";
const CONTOH = ["Ada produk apa saja?", "Rekomendasikan oleh-oleh", "Bagaimana cara memesan?"];

function IkonRobot() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8.01" y2="16" />
      <line x1="16" y1="16" x2="16.01" y2="16" />
    </svg>
  );
}

export default function ChatbotMelayang() {
  const pathname = usePathname();
  const [terbuka, setTerbuka] = useState(false);
  const [pesan, setPesan] = useState("");
  const [riwayat, setRiwayat] = useState([{ role: "assistant", content: SAPAAN }]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const akhirRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (terbuka) {
      akhirRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [terbuka, riwayat, pending]);

  if (pathname?.startsWith("/admin")) return null;

  async function kirim(teks) {
    const bersih = String(teks || "").trim();
    if (pending || bersih.length < 2 || bersih.length > 300) {
      if (bersih.length > 0) setError("Pesan harus terdiri dari 2 sampai 300 karakter.");
      return;
    }

    const riwayatSebelumnya = riwayat.slice(-4);
    setRiwayat((daftar) => [...daftar, { role: "user", content: bersih }]);
    setPesan("");
    setError("");
    setPending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesan: bersih, riwayat: riwayatSebelumnya }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Pesan gagal dikirim.");
      setRiwayat((daftar) => [...daftar, { role: "assistant", content: data.jawaban }]);
    } catch (err) {
      setError(err.message || "Asisten sedang tidak dapat dihubungi.");
    } finally {
      setPending(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    kirim(pesan);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {terbuka && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="judul-chatbot"
          className="mb-3 flex h-[min(32rem,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-garis bg-latar shadow-2xl sm:ml-auto"
        >
          <header className="flex items-center justify-between gap-3 bg-utama px-4 py-3 text-white">
            <div>
              <h2 id="judul-chatbot" className="font-extrabold">Asisten E-Craf</h2>
              <p className="text-xs text-white/80">Jawaban berdasarkan katalog toko</p>
            </div>
            <button
              type="button"
              onClick={() => setTerbuka(false)}
              aria-label="Tutup asisten"
              className="flex h-9 w-9 items-center justify-center rounded-full text-xl hover:bg-white/15"
            >
              ×
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {riwayat.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  item.role === "user"
                    ? "ml-auto rounded-br-md bg-utama text-white"
                    : "rounded-bl-md border border-garis bg-permukaan text-teks"
                }`}
              >
                {item.content}
              </div>
            ))}
            {riwayat.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {CONTOH.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => kirim(item)}
                    className="rounded-full border border-garis px-3 py-1.5 text-xs font-semibold text-utama hover:border-utama"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
            {pending && <p className="text-sm text-teks-lembut">Asisten sedang mengetik...</p>}
            {error && <p role="alert" className="rounded-lg bg-permukaan p-2 text-sm font-semibold text-bahaya">{error}</p>}
            <div ref={akhirRef} />
          </div>

          <form onSubmit={submit} className="border-t border-garis bg-latar p-3">
            <label htmlFor="pesan-chatbot" className="sr-only">Pesan untuk asisten</label>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                id="pesan-chatbot"
                value={pesan}
                onChange={(event) => setPesan(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submit(event);
                  }
                }}
                rows={1}
                maxLength={300}
                placeholder="Tanyakan produk..."
                className="max-h-24 min-h-11 flex-1 resize-none rounded-xl border border-garis bg-latar px-3 py-2.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
              />
              <button
                type="submit"
                disabled={pending || pesan.trim().length < 2}
                className="flex h-11 items-center justify-center rounded-xl bg-utama px-4 text-sm font-bold text-white hover:bg-utama-gelap disabled:cursor-not-allowed disabled:opacity-50"
              >
                Kirim
              </button>
            </div>
            <p className="mt-1 text-right text-xs text-teks-lembut">{pesan.length}/300</p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setTerbuka((nilai) => !nilai)}
        aria-label={terbuka ? "Tutup asisten toko" : "Buka asisten toko"}
        aria-expanded={terbuka}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-utama text-white shadow-xl transition-transform hover:scale-105 hover:bg-utama-gelap focus:outline-none focus:ring-4 focus:ring-utama/30"
      >
        {terbuka ? <span aria-hidden="true" className="text-2xl">×</span> : <IkonRobot />}
      </button>
    </div>
  );
}
