"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pastikanAdminAktif } from "@/lib/admin/server";
import { validasiNomorWhatsApp } from "@/lib/pengaturan-toko";

export async function simpanPengaturanToko(formData) {
  const { supabase } = await pastikanAdminAktif();
  const nama = String(formData.get("nama") ?? "").trim();
  const alamat = String(formData.get("alamat") ?? "").trim();
  const jamBuka = String(formData.get("jam_buka") ?? "").trim();
  const { nomor, error: errorNomor } = validasiNomorWhatsApp(formData.get("nomor_whatsapp"));

  if (!nama || nama.length > 100 || !alamat || !jamBuka || errorNomor) {
    redirect(`/admin/pengaturan?status=${errorNomor ? "nomor-tidak-valid" : "input-tidak-valid"}`);
  }

  const { error } = await supabase.from("pengaturan_toko").upsert(
    { id: 1, nama, nomor_whatsapp: nomor, alamat, jam_buka: jamBuka },
    { onConflict: "id" }
  );
  if (error) redirect("/admin/pengaturan?status=gagal");

  revalidatePath("/", "layout");
  redirect("/admin/pengaturan?status=tersimpan");
}
