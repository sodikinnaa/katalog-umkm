"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseSesi } from "@/lib/supabase/server";

async function pastikanAdmin() {
  const supabase = await supabaseSesi();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return supabase;
}

export async function login(formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/admin/login?error=kosong");
  }

  const supabase = await supabaseSesi();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/admin/login?error=salah");
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await supabaseSesi();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function gantiPassword(formData) {
  const supabase = await pastikanAdmin();
  const passwordBaru = String(formData.get("password_baru") ?? "");
  const konfirmasi = String(formData.get("konfirmasi_password") ?? "");

  if (passwordBaru.length < 8) {
    redirect("/admin/password?status=pendek");
  }

  if (passwordBaru !== konfirmasi) {
    redirect("/admin/password?status=beda");
  }

  const { error } = await supabase.auth.updateUser({ password: passwordBaru });

  if (error) {
    redirect("/admin/password?status=gagal");
  }

  redirect("/admin/password?status=berhasil");
}

function bacaProduk(formData) {
  const nilai = {
    nama: String(formData.get("nama") ?? "").trim(),
    harga: String(formData.get("harga") ?? "").trim(),
    kategori: String(formData.get("kategori") ?? "").trim(),
    foto_url: String(formData.get("foto_url") ?? "").trim(),
    deskripsi: String(formData.get("deskripsi") ?? "").trim(),
  };
  const errors = {};
  const harga = Number(nilai.harga);

  if (!nilai.nama) errors.nama = "Nama produk wajib diisi.";
  if (!nilai.harga) errors.harga = "Harga wajib diisi.";
  else if (!Number.isInteger(harga) || harga <= 0) errors.harga = "Harga harus berupa angka bulat positif.";

  return { nilai, harga, errors };
}

export async function tambahProduk(_state, formData) {
  const supabase = await pastikanAdmin();
  const { nilai, harga, errors } = bacaProduk(formData);

  if (Object.keys(errors).length > 0) {
    return { errors, nilai };
  }

  const { error } = await supabase.from("produk").insert([
    {
      nama: nilai.nama,
      harga,
      kategori: nilai.kategori || null,
      foto_url: nilai.foto_url || "/produk/kopi.svg",
      deskripsi: nilai.deskripsi || null,
    },
  ]);

  if (error) {
    return { errors: { form: "Produk gagal disimpan. Silakan coba lagi." }, nilai };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function ubahProduk(id, _state, formData) {
  const supabase = await pastikanAdmin();
  const { nilai, harga, errors } = bacaProduk(formData);

  if (!id) errors.form = "Produk tidak ditemukan.";
  if (Object.keys(errors).length > 0) {
    return { errors, nilai };
  }

  const { error } = await supabase
    .from("produk")
    .update({
      nama: nilai.nama,
      harga,
      kategori: nilai.kategori || null,
      foto_url: nilai.foto_url || "/produk/kopi.svg",
      deskripsi: nilai.deskripsi || null,
    })
    .eq("id", id);

  if (error) {
    return { errors: { form: "Perubahan gagal disimpan. Silakan coba lagi." }, nilai };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/produk/${id}`);
  redirect("/admin");
}

export async function hapusProduk(formData) {
  const supabase = await pastikanAdmin();
  const id = formData.get("id");

  if (!id) {
    return;
  }

  const { error } = await supabase.from("produk").delete().eq("id", id);

  if (error) {
    throw new Error(`Gagal menghapus produk: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}
