"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pastikanAdminAktif } from "@/lib/admin/server";
import { tautanAman } from "@/lib/pengaturan-toko";

function kembali(status) {
  redirect(`/admin/banner?status=${status}`);
}

function bacaBanner(formData) {
  const judul = String(formData.get("judul") ?? "").trim();
  const teks = String(formData.get("teks") ?? "").trim();
  const gambarMasukan = String(formData.get("gambar_url") ?? "").trim();
  const tautanMasukan = String(formData.get("tautan") ?? "").trim();
  const gambarUrl = tautanAman(gambarMasukan);
  const tautan = tautanAman(tautanMasukan);

  if (!judul || judul.length > 120) return { error: "judul-tidak-valid" };
  if (gambarMasukan && !gambarUrl) return { error: "gambar-tidak-valid" };
  if (tautanMasukan && !tautan) return { error: "tautan-tidak-valid" };
  return { nilai: { judul, teks: teks || null, gambar_url: gambarUrl, tautan } };
}

export async function tambahBanner(formData) {
  const { supabase } = await pastikanAdminAktif();
  const hasil = bacaBanner(formData);
  if (hasil.error) kembali(hasil.error);

  const { error } = await supabase.from("banner").insert({ ...hasil.nilai, aktif: true });
  if (error) kembali("gagal-tambah");

  revalidatePath("/");
  revalidatePath("/admin/banner");
  kembali("ditambahkan");
}

export async function ubahBanner(id, formData) {
  const { supabase } = await pastikanAdminAktif();
  const bannerId = Number.parseInt(id, 10);
  if (!Number.isSafeInteger(bannerId) || bannerId < 1) kembali("tidak-ditemukan");
  const hasil = bacaBanner(formData);
  if (hasil.error) redirect(`/admin/banner/${bannerId}/ubah?status=${hasil.error}`);

  const { data, error } = await supabase.from("banner").update(hasil.nilai).eq("id", bannerId).select("id").maybeSingle();
  if (error || !data) redirect(`/admin/banner/${bannerId}/ubah?status=gagal`);

  revalidatePath("/");
  revalidatePath("/admin/banner");
  kembali("diubah");
}

export async function aturStatusBanner(formData) {
  const { supabase } = await pastikanAdminAktif();
  const id = Number.parseInt(formData.get("id"), 10);
  const aktif = String(formData.get("aktif")) === "true";
  if (!Number.isSafeInteger(id) || id < 1) kembali("tidak-ditemukan");

  const { error } = await supabase.from("banner").update({ aktif }).eq("id", id);
  if (error) kembali("gagal-status");

  revalidatePath("/");
  revalidatePath("/admin/banner");
  kembali(aktif ? "diaktifkan" : "dinonaktifkan");
}
