"use client";

import { useActionState } from "react";
import Tombol from "@/components/Tombol";

export default function FormImporCsv({ action }) {
  const [state, formAction, pending] = useActionState(action, { errors: {} });
  const errors = state.errors ?? {};
  const hasilAda = Boolean(state.ringkasan);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        File CSV
        <input
          key={state.namaFile ?? "awal"}
          type="file"
          name="file"
          accept=".csv,text/csv"
          aria-invalid={Boolean(errors.form)}
          aria-describedby={errors.form ? "error-impor" : "petunjuk-impor"}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-permukaan file:px-3 file:py-2 file:font-semibold file:text-teks"
          required
        />
        <span id="petunjuk-impor" className="font-normal text-teks-lembut">
          Maksimal 1 MB dan 500 baris produk. Header wajib: nama,harga. Header opsional: kategori,deskripsi,foto_url.
        </span>
      </label>

      {state.namaFile && <p className="text-sm text-teks-lembut">File terakhir: {state.namaFile}</p>}
      {errors.form && (
        <p id="error-impor" role="alert" className="rounded-lg border border-bahaya p-3 text-sm font-semibold text-bahaya">
          {errors.form}
        </p>
      )}

      {hasilAda && (
        <section aria-live="polite" className="rounded-2xl border border-garis bg-permukaan p-4">
          <h2 className="font-extrabold">Hasil impor</h2>
          <p className="mt-1 text-sm">
            Berhasil: <strong>{state.ringkasan.berhasil}</strong> produk. Gagal: <strong>{state.ringkasan.gagal}</strong> baris.
          </p>
          {state.gagal?.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-bahaya">
              {state.gagal.map(({ baris, alasan }) => (
                <li key={`${baris}-${alasan}`}>Baris {baris}: {alasan}.</li>
              ))}
            </ul>
          )}
        </section>
      )}

      <Tombol type="submit" disabled={pending} className="self-start">
        {pending ? "Mengimpor..." : "Impor produk"}
      </Tombol>
    </form>
  );
}
