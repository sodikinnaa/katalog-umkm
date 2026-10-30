"use client";

import { useState } from "react";
import Tombol from "@/components/Tombol";

export default function AsistenProduk({ produkId }) {
  const [pertanyaan, setPertanyaan] = useState("");
  const [jawaban, setJawaban] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function tanya(event) {
    event.preventDefault();
    setError("");
    setJawaban("");

    if (pertanyaan.trim().length < 3 || pertanyaan.trim().length > 300) {
      setError("Pertanyaan harus terdiri dari 3 sampai 300 karakter.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch(`/api/produk/${encodeURIComponent(produkId)}/tanya`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pertanyaan }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Pertanyaan gagal dikirim.");
      setJawaban(data.jawaban);
    } catch (err) {
      setError(err.message || "Pertanyaan gagal dikirim. Silakan coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-labelledby="judul-asisten-produk" className="mb-10 max-w-2xl rounded-2xl border border-garis bg-permukaan p-5">
      <h2 id="judul-asisten-produk" className="text-xl font-bold">Tanya tentang produk</h2>
      <p className="mt-1 text-sm text-teks-lembut">Asisten menjawab berdasarkan informasi produk pada katalog.</p>
      <form onSubmit={tanya} className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Pertanyaan
          <textarea
            value={pertanyaan}
            onChange={(event) => setPertanyaan(event.target.value)}
            minLength={3}
            maxLength={300}
            rows={3}
            placeholder="Contoh: Produk ini termasuk kategori apa?"
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            required
          />
        </label>
        <div className="flex items-center gap-3">
          <Tombol type="submit" disabled={pending}>{pending ? "Menjawab..." : "Tanyakan"}</Tombol>
          <span className="text-sm text-teks-lembut">{pertanyaan.length}/300</span>
        </div>
      </form>
      {error && <p role="alert" className="mt-4 text-sm font-semibold text-bahaya">{error}</p>}
      {jawaban && <div aria-live="polite" className="mt-4 rounded-lg border border-garis bg-latar p-4"><p className="font-semibold">Jawaban</p><p className="mt-1 whitespace-pre-wrap text-teks-lembut">{jawaban}</p></div>}
    </section>
  );
}
