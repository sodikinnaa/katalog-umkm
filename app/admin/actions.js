"use server";

import { redirect } from "next/navigation";
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
