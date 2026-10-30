"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabasePublik } from "@/lib/supabase/server";

function kembali(produkId, status) {
  redirect(`/produk/${produkId}?ulasan=${status}#ulasan`);
}

export async function kirimUlasan(produkId, formData) {
  const id = Number(produkId);
  const nama = String(formData.get("nama") ?? "").trim();
  const rating = Number(formData.get("rating"));
  const komentar = String(formData.get("komentar") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();

  if (!Number.isInteger(id) || id < 1) kembali(produkId, "tidak-valid");
  if (website) kembali(id, "berhasil");
  if (nama.length < 1 || nama.length > 60) kembali(id, "nama");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) kembali(id, "rating");
  if (komentar.length < 1 || komentar.length > 1000) kembali(id, "komentar");

  const daftarHeader = await headers();
  const alamat = daftarHeader.get("x-forwarded-for")?.split(",")[0]?.trim() || "tidak-diketahui";
  const kunci = createHash("sha256")
    .update(`${alamat}:${process.env.SUPABASE_SECRET_KEY}`)
    .digest("hex");
  const supabase = supabasePublik();
  const { data: diizinkan, error: errorBatas } = await supabase.rpc("ambil_jatah_kiriman", {
    p_jenis: "ulasan",
    p_kunci: kunci,
    p_maks: 3,
    p_detik: 3600,
  });

  if (errorBatas) throw new Error(`Gagal memeriksa batas kiriman: ${errorBatas.message}`);
  if (!diizinkan) kembali(id, "terlalu-sering");

  const { error } = await supabase.from("ulasan").insert({ produk_id: id, nama, rating, komentar });

  if (error) kembali(id, "gagal");

  revalidatePath(`/produk/${id}`);
  kembali(id, "berhasil");
}
