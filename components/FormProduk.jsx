"use client";

import { useActionState, useRef } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import TombolDeskripsiAI from "@/components/TombolDeskripsiAI";

function PesanError({ id, pesan }) {
  if (!pesan) return null;
  return <p id={id} className="-mt-2 text-sm font-semibold text-bahaya">{pesan}</p>;
}

export default function FormProduk({ produk = {}, kategori = [], labelTombol, action }) {
  const [state, formAction, pending] = useActionState(action, { errors: {}, nilai: produk });
  const nilai = state.nilai ?? produk;
  const errors = state.errors ?? {};
  const formRef = useRef(null);
  const kelasSelect = "w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none";

  function isiDeskripsi(teks) {
    const textarea = formRef.current?.elements.namedItem("deskripsi");
    if (!textarea) return;
    textarea.value = teks;
    textarea.focus();
  }

  return (
    <form ref={formRef} action={formAction} encType="multipart/form-data" noValidate className="flex max-w-xl flex-col gap-4">
      {errors.form && <p role="alert" className="text-sm font-semibold text-bahaya">{errors.form}</p>}
      <Input key={`nama-${nilai.nama ?? ""}`} label="Nama produk" name="nama" defaultValue={nilai.nama} aria-invalid={Boolean(errors.nama)} required />
      <PesanError id="error-nama" pesan={errors.nama} />
      <Input key={`harga-${nilai.harga ?? ""}`} label="Harga normal (Rp)" name="harga" type="number" min="1" step="1" defaultValue={nilai.harga} aria-invalid={Boolean(errors.harga)} required />
      <PesanError id="error-harga" pesan={errors.harga} />
      <Input key={`diskon-${nilai.harga_diskon ?? ""}`} label="Harga diskon (opsional)" name="harga_diskon" type="number" min="0" step="1" defaultValue={nilai.harga_diskon ?? ""} aria-invalid={Boolean(errors.harga_diskon)} />
      <PesanError id="error-harga-diskon" pesan={errors.harga_diskon} />
      <Input key={`stok-${nilai.stok ?? 0}`} label="Stok" name="stok" type="number" min="0" step="1" defaultValue={nilai.stok ?? 0} aria-invalid={Boolean(errors.stok)} required />
      <PesanError id="error-stok" pesan={errors.stok} />
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Kategori
        <select key={`kategori-${nilai.kategori ?? ""}`} name="kategori" defaultValue={nilai.kategori ?? ""} className={kelasSelect} aria-invalid={Boolean(errors.kategori)} required>
          <option value="">Pilih kategori</option>
          {kategori.map((item) => <option key={item.id} value={item.nama}>{item.nama}</option>)}
        </select>
      </label>
      <PesanError id="error-kategori" pesan={errors.kategori} />
      <Input key={`badge-${nilai.badge ?? ""}`} label="Badge (opsional)" name="badge" maxLength={50} placeholder="Baru atau Terlaris" defaultValue={nilai.badge ?? ""} />
      <PesanError id="error-badge" pesan={errors.badge} />
      <Input key={`foto-url-${nilai.foto_url ?? ""}`} label="Link foto cadangan" name="foto_url" placeholder="https://... atau /produk/nama-file.svg" defaultValue={nilai.foto_url} />
      <Input label="Unggah foto (maksimal 5 MB per file)" name="foto" type="file" accept="image/jpeg,image/png,image/webp" multiple />
      <PesanError id="error-foto" pesan={errors.foto} />
      <Input key={`deskripsi-${nilai.deskripsi ?? ""}`} label="Deskripsi" name="deskripsi" textarea defaultValue={nilai.deskripsi} />
      <TombolDeskripsiAI formRef={formRef} onHasil={isiDeskripsi} />
      <div className="flex gap-3">
        <Tombol type="submit" disabled={pending}>{pending ? "Menyimpan..." : labelTombol}</Tombol>
        <Tombol href="/admin" varian="garis">Batal</Tombol>
      </div>
    </form>
  );
}
