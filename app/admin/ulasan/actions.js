"use server";

import { revalidatePath } from "next/cache";
import { catatLog, pastikanAdminAktif } from "@/lib/admin/server";

function bacaId(formData) {
  const id = Number(formData.get("id"));
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function segarkan(supabase, id) {
  const { data } = await supabase.from("ulasan").select("produk_id").eq("id", id).maybeSingle();
  revalidatePath("/admin/ulasan");
  if (data?.produk_id) revalidatePath(`/produk/${data.produk_id}`);
}

export async function ubahTampilUlasan(formData) {
  const { user, supabase } = await pastikanAdminAktif();
  const id = bacaId(formData);
  const tampil = formData.get("tampil") === "true";
  if (!id) return;

  await segarkan(supabase, id);
  const { error } = await supabase.from("ulasan").update({ tampil }).eq("id", id);
  if (error) throw new Error(`Gagal mengubah ulasan: ${error.message}`);

  await catatLog(user, { aksi: tampil ? "tampilkan_ulasan" : "sembunyikan_ulasan", entitas: "ulasan", entitasId: id });
}

export async function hapusUlasan(formData) {
  const { user, supabase } = await pastikanAdminAktif();
  const id = bacaId(formData);
  if (!id) return;

  await segarkan(supabase, id);
  const { error } = await supabase.from("ulasan").delete().eq("id", id);
  if (error) throw new Error(`Gagal menghapus ulasan: ${error.message}`);

  await catatLog(user, { aksi: "hapus_ulasan", entitas: "ulasan", entitasId: id });
}
