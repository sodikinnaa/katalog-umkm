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

export async function tambahProduk(formData) {
  const supabase = await pastikanAdmin();
  const nama = String(formData.get("nama") ?? "").trim();
  const hargaRaw = formData.get("harga");
  const harga = parseInt(hargaRaw, 10);
  const kategori = String(formData.get("kategori") ?? "").trim();
  const foto_url = String(formData.get("foto_url") ?? "").trim() || "/produk/kopi.svg";
  const deskripsi = String(formData.get("deskripsi") ?? "").trim();

  if (!nama || isNaN(harga) || harga < 0) {
    redirect("/admin/produk/baru?error=invalid");
  }

  const { error } = await supabase.from("produk").insert([
    {
      nama,
      harga,
      kategori: kategori || null,
      foto_url,
      deskripsi: deskripsi || null,
    },
  ]);

  if (error) {
    throw new Error(`Gagal menambah produk: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function ubahProduk(id, formData) {
  const supabase = await pastikanAdmin();
  const nama = String(formData.get("nama") ?? "").trim();
  const hargaRaw = formData.get("harga");
  const harga = parseInt(hargaRaw, 10);
  const kategori = String(formData.get("kategori") ?? "").trim();
  const foto_url = String(formData.get("foto_url") ?? "").trim() || "/produk/kopi.svg";
  const deskripsi = String(formData.get("deskripsi") ?? "").trim();

  if (!id || !nama || isNaN(harga) || harga < 0) {
    redirect(`/admin/produk/${id}/ubah?error=invalid`);
  }

  const { error } = await supabase
    .from("produk")
    .update({
      nama,
      harga,
      kategori: kategori || null,
      foto_url,
      deskripsi: deskripsi || null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Gagal mengubah produk: ${error.message}`);
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
