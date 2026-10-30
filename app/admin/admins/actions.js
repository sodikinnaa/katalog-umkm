"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { catatLog, galatTabel, pastikanAdminAktif } from "@/lib/admin/server";
import { supabasePublik } from "@/lib/supabase/server";

function kembali(status) {
  redirect(`/admin/admins?status=${status}`);
}

export async function tambahAdmin(formData) {
  const { user: aktor } = await pastikanAdminAktif();
  const nama = String(formData.get("nama") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!nama || !email || password.length < 8) {
    kembali("input-tidak-valid");
  }

  const admin = supabasePublik();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    kembali("gagal-tambah");
  }

  const { error: profilError } = await admin.from("admin_profile").upsert({
    user_id: data.user.id,
    email,
    nama,
    aktif: true,
  });

  if (profilError) {
    await admin.auth.admin.deleteUser(data.user.id);
    throw galatTabel("admin_profile", profilError);
  }

  await catatLog(aktor, {
    aksi: "tambah_admin",
    entitas: "admin",
    entitasId: data.user.id,
    detail: { email, nama },
  });
  revalidatePath("/admin/admins");
  kembali("ditambahkan");
}

export async function aturStatusAdmin(formData) {
  const { user: aktor } = await pastikanAdminAktif();
  const userId = String(formData.get("user_id") ?? "");
  const aktif = String(formData.get("aktif") ?? "") === "true";

  if (!userId || userId === aktor.id) {
    kembali("aksi-ditolak");
  }

  const admin = supabasePublik();
  const { data: target, error: targetError } = await admin.auth.admin.getUserById(userId);
  if (targetError || !target.user) {
    kembali("admin-tidak-ditemukan");
  }

  const { error } = await admin.from("admin_profile").update({ aktif }).eq("user_id", userId);
  if (error) {
    throw galatTabel("admin_profile", error);
  }

  await catatLog(aktor, {
    aksi: aktif ? "aktifkan_admin" : "nonaktifkan_admin",
    entitas: "admin",
    entitasId: userId,
    detail: { email: target.user.email },
  });
  revalidatePath("/admin/admins");
  kembali(aktif ? "diaktifkan" : "dinonaktifkan");
}

export async function hapusAdmin(formData) {
  const { user: aktor } = await pastikanAdminAktif();
  const userId = String(formData.get("user_id") ?? "");

  if (!userId || userId === aktor.id) {
    kembali("aksi-ditolak");
  }

  const admin = supabasePublik();
  const { data: target, error: targetError } = await admin.auth.admin.getUserById(userId);
  if (targetError || !target.user) {
    kembali("admin-tidak-ditemukan");
  }

  const detail = { email: target.user.email };
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    kembali("gagal-hapus");
  }

  const { error: profilError } = await admin.from("admin_profile").delete().eq("user_id", userId);
  if (profilError) {
    throw galatTabel("admin_profile", profilError);
  }

  await catatLog(aktor, {
    aksi: "hapus_admin",
    entitas: "admin",
    entitasId: userId,
    detail,
  });
  revalidatePath("/admin/admins");
  kembali("dihapus");
}
