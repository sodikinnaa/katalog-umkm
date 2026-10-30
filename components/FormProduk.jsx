"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09). Keduanya bonus di jalur offline.
// Nama field sama dengan kolom tabel "produk".
function PesanError({ id, pesan }) {
  if (!pesan) return null;
  return (
    <p id={id} className="-mt-2 text-sm font-semibold text-bahaya">
      {pesan}
    </p>
  );
}

export default function FormProduk({ produk = {}, labelTombol, action }) {
  const [state, formAction, pending] = useActionState(action, { errors: {}, nilai: produk });
  const nilai = state.nilai ?? produk;
  const errors = state.errors ?? {};

  return (
    <form action={formAction} noValidate className="flex max-w-xl flex-col gap-4">
      {errors.form && (
        <p role="alert" className="text-sm font-semibold text-bahaya">
          {errors.form}
        </p>
      )}
      <Input
        key={`nama-${nilai.nama ?? ""}`}
        label="Nama produk"
        name="nama"
        defaultValue={nilai.nama}
        aria-invalid={Boolean(errors.nama)}
        aria-describedby={errors.nama ? "error-nama" : undefined}
        required
      />
      <PesanError id="error-nama" pesan={errors.nama} />
      <Input
        key={`harga-${nilai.harga ?? ""}`}
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="1"
        step="1"
        defaultValue={nilai.harga}
        aria-invalid={Boolean(errors.harga)}
        aria-describedby={errors.harga ? "error-harga" : undefined}
        required
      />
      <PesanError id="error-harga" pesan={errors.harga} />
      <Input key={`kategori-${nilai.kategori ?? ""}`} label="Kategori" name="kategori" defaultValue={nilai.kategori} />
      <Input
        key={`foto-${nilai.foto_url ?? ""}`}
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={nilai.foto_url}
      />
      <Input
        key={`deskripsi-${nilai.deskripsi ?? ""}`}
        label="Deskripsi"
        name="deskripsi"
        textarea
        defaultValue={nilai.deskripsi}
      />
      <div className="flex gap-3">
        <Tombol type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
