"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { galatTabel, pastikanAdminAktif } from "@/lib/admin/server";
import { bacaIdPositif, bacaVarian } from "@/lib/varian";

function kembali(produkId, status) {
  redirect(`/admin/produk/${produkId}/varian?status=${status}`);
}

async function produkAda(supabase, produkId) {
  const { data, error } = await supabase.from("produk").select("id").eq("id", produkId).maybeSingle();
  if (error) throw galatTabel("produk", error);
  return Boolean(data);
}

async function ambilVarian(supabase, produkId, varianId) {
  const { data, error } = await supabase
    .from("varian_produk")
    .select("id, produk_id, aktif, urutan")
    .eq("id", varianId)
    .eq("produk_id", produkId)
    .maybeSingle();
  if (error) throw galatTabel("varian_produk", error);
  return data;
}

function segarkan(produkId) {
  revalidatePath(`/admin/produk/${produkId}/varian`);
  revalidatePath(`/produk/${produkId}`);
}

export async function tambahVarian(produkId, formData) {
  const { supabase } = await pastikanAdminAktif();
  const id = bacaIdPositif(produkId);
  const { galat, data } = bacaVarian(formData);
  if (!id || !(await produkAda(supabase, id))) kembali(produkId, "produk-tidak-ditemukan");
  if (galat) kembali(id, `input-${galat}`);

  const { error } = await supabase.from("varian_produk").insert({ produk_id: id, ...data });
  if (error?.code === "23505") kembali(id, "nama-duplikat");
  if (error) throw galatTabel("varian_produk", error);
  segarkan(id);
  kembali(id, "ditambahkan");
}

export async function ubahVarian(produkId, formData) {
  const { supabase } = await pastikanAdminAktif();
  const id = bacaIdPositif(produkId);
  const varianId = bacaIdPositif(formData.get("varian_id"));
  const { galat, data } = bacaVarian(formData);
  if (!id || !varianId || !(await ambilVarian(supabase, id, varianId))) kembali(produkId, "varian-tidak-ditemukan");
  if (galat) kembali(id, `input-${galat}`);

  const { error } = await supabase.from("varian_produk").update(data).eq("id", varianId).eq("produk_id", id);
  if (error?.code === "23505") kembali(id, "nama-duplikat");
  if (error) throw galatTabel("varian_produk", error);
  segarkan(id);
  kembali(id, "diubah");
}

export async function hapusVarian(produkId, formData) {
  const { supabase } = await pastikanAdminAktif();
  const id = bacaIdPositif(produkId);
  const varianId = bacaIdPositif(formData.get("varian_id"));
  if (!id || !varianId || !(await ambilVarian(supabase, id, varianId))) kembali(produkId, "varian-tidak-ditemukan");

  const { error } = await supabase.from("varian_produk").delete().eq("id", varianId).eq("produk_id", id);
  if (error) throw galatTabel("varian_produk", error);
  segarkan(id);
  kembali(id, "dihapus");
}

export async function aturAktifVarian(produkId, formData) {
  const { supabase } = await pastikanAdminAktif();
  const id = bacaIdPositif(produkId);
  const varianId = bacaIdPositif(formData.get("varian_id"));
  const varian = id && varianId ? await ambilVarian(supabase, id, varianId) : null;
  if (!varian) kembali(produkId, "varian-tidak-ditemukan");

  const { error } = await supabase.from("varian_produk").update({ aktif: !varian.aktif }).eq("id", varianId).eq("produk_id", id);
  if (error) throw galatTabel("varian_produk", error);
  segarkan(id);
  kembali(id, varian.aktif ? "dinonaktifkan" : "diaktifkan");
}

export async function geserVarian(produkId, formData) {
  const { supabase } = await pastikanAdminAktif();
  const id = bacaIdPositif(produkId);
  const varianId = bacaIdPositif(formData.get("varian_id"));
  const arah = String(formData.get("arah") ?? "");
  if (!id || !varianId || !["naik", "turun"].includes(arah)) kembali(produkId, "varian-tidak-ditemukan");

  const { data: daftar, error } = await supabase
    .from("varian_produk")
    .select("id, urutan")
    .eq("produk_id", id)
    .order("urutan", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw galatTabel("varian_produk", error);

  const posisi = daftar.findIndex((item) => item.id === varianId);
  const tujuan = arah === "naik" ? posisi - 1 : posisi + 1;
  if (posisi < 0 || tujuan < 0 || tujuan >= daftar.length) kembali(id, "urutan-tetap");

  const urutBaru = [...daftar];
  const [dipindah] = urutBaru.splice(posisi, 1);
  urutBaru.splice(tujuan, 0, dipindah);
  for (const [urutan, item] of urutBaru.entries()) {
    const { error: errorUrutan } = await supabase
      .from("varian_produk")
      .update({ urutan })
      .eq("id", item.id)
      .eq("produk_id", id);
    if (errorUrutan) throw galatTabel("varian_produk", errorUrutan);
  }

  segarkan(id);
  kembali(id, "diurutkan");
}
