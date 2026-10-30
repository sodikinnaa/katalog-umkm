"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { catatLog, pastikanAdminAktif } from "@/lib/admin/server";

function kembali(status) {
  revalidatePath("/admin/kategori");
  revalidatePath("/");
  redirect(`/admin/kategori?status=${status}`);
}

function bacaNama(formData) {
  const nama = String(formData.get("nama") ?? "").trim();
  return nama.length >= 1 && nama.length <= 100 ? nama : null;
}

export async function tambahKategori(formData) {
  const { user, supabase } = await pastikanAdminAktif();
  const nama = bacaNama(formData);
  if (!nama) kembali("nama-tidak-valid");
  const { data, error } = await supabase.from("kategori").insert({ nama }).select("id").single();
  if (error) kembali(error.code === "23505" ? "sudah-ada" : "gagal");
  await catatLog(user, { aksi: "tambah_kategori", entitas: "kategori", entitasId: data.id, detail: { nama } });
  kembali("ditambahkan");
}

export async function ubahKategori(formData) {
  const { user, supabase } = await pastikanAdminAktif();
  const id = String(formData.get("id") ?? "");
  const nama = bacaNama(formData);
  if (!id || !nama) kembali("nama-tidak-valid");
  const { error } = await supabase.from("kategori").update({ nama }).eq("id", id);
  if (error) kembali(error.code === "23505" ? "sudah-ada" : "gagal");
  await catatLog(user, { aksi: "ubah_kategori", entitas: "kategori", entitasId: id, detail: { nama } });
  kembali("diubah");
}

export async function hapusKategori(formData) {
  const { user, supabase } = await pastikanAdminAktif();
  const id = String(formData.get("id") ?? "");
  if (!id) kembali("gagal");
  const { data: kategori } = await supabase.from("kategori").select("nama").eq("id", id).maybeSingle();
  if (!kategori) kembali("gagal");
  const { count } = await supabase.from("produk").select("id", { count: "exact", head: true }).eq("kategori", kategori.nama);
  if (count > 0) kembali("masih-dipakai");
  const { error } = await supabase.from("kategori").delete().eq("id", id);
  if (error) kembali(error.code === "23503" ? "masih-dipakai" : "gagal");
  await catatLog(user, { aksi: "hapus_kategori", entitas: "kategori", entitasId: id, detail: { nama: kategori.nama } });
  kembali("dihapus");
}
