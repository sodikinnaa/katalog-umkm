"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { catatLog, pastikanAdminAktif } from "@/lib/admin/server";
import { supabaseSesi } from "@/lib/supabase/server";
import { FOTO_CADANGAN } from "@/lib/produk";

const BUCKET = "produk";
const MAKS_FOTO = 5 * 1024 * 1024;
const TIPE_FOTO = {
  "image/jpeg": { ekstensi: "jpg", cocok: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { ekstensi: "png", cocok: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  "image/webp": { ekstensi: "webp", cocok: (b) => String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP" },
};

async function pastikanAdmin() {
  const { supabase } = await pastikanAdminAktif();
  return supabase;
}

export async function login(formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/admin/login?error=kosong");
  const client = await supabaseSesi();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) redirect("/admin/login?error=salah");
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
  if (passwordBaru.length < 8) redirect("/admin/password?status=pendek");
  if (passwordBaru !== konfirmasi) redirect("/admin/password?status=beda");
  const { error } = await supabase.auth.updateUser({ password: passwordBaru });
  redirect(error ? "/admin/password?status=gagal" : "/admin/password?status=berhasil");
}

function bacaProduk(formData) {
  const nilai = Object.fromEntries(
    ["nama", "harga", "harga_diskon", "kategori", "foto_url", "deskripsi", "stok", "badge"].map((nama) => [
      nama,
      String(formData.get(nama) ?? "").trim(),
    ])
  );
  const errors = {};
  const harga = Number(nilai.harga);
  const hargaDiskon = nilai.harga_diskon === "" ? null : Number(nilai.harga_diskon);
  const stok = Number(nilai.stok);
  if (!nilai.nama) errors.nama = "Nama produk wajib diisi.";
  if (!nilai.harga) errors.harga = "Harga wajib diisi.";
  else if (!Number.isInteger(harga) || harga <= 0) errors.harga = "Harga harus berupa angka bulat positif.";
  if (!Number.isInteger(stok) || stok < 0) errors.stok = "Stok harus berupa angka bulat nol atau lebih.";
  if (hargaDiskon !== null && (!Number.isInteger(hargaDiskon) || hargaDiskon < 0 || hargaDiskon >= harga)) {
    errors.harga_diskon = "Harga diskon harus nol atau lebih dan lebih kecil dari harga normal.";
  }
  if (nilai.badge.length > 50) errors.badge = "Badge maksimal 50 karakter.";
  if (!nilai.kategori) errors.kategori = "Pilih kategori produk.";
  return { nilai, harga, hargaDiskon, stok, errors };
}

async function validasiFoto(file) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAKS_FOTO) throw new Error("Ukuran setiap foto maksimal 5 MB.");
  const tipe = TIPE_FOTO[file.type];
  if (!tipe) throw new Error("Foto harus berformat JPG, PNG, atau WebP.");
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!tipe.cocok(bytes)) throw new Error("Isi file tidak cocok dengan format gambar yang dipilih.");
  return { file, ekstensi: tipe.ekstensi };
}

async function unggahFoto(supabase, produkId, files) {
  const tersimpan = [];
  try {
    for (let index = 0; index < files.length; index += 1) {
      const foto = await validasiFoto(files[index]);
      if (!foto) continue;
      const path = `${produkId}/${crypto.randomUUID()}.${foto.ekstensi}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, foto.file, {
        contentType: foto.file.type,
        upsert: false,
      });
      if (uploadError) throw uploadError;
      tersimpan.push(path);
    }
    if (tersimpan.length) {
      const { count } = await supabase.from("foto_produk").select("id", { count: "exact", head: true }).eq("produk_id", produkId);
      const awalUrutan = count ?? 0;
      const { error } = await supabase.from("foto_produk").insert(
        tersimpan.map((storage_path, index) => ({ produk_id: produkId, storage_path, urutan: awalUrutan + index }))
      );
      if (error) throw error;
    }
    return tersimpan;
  } catch (error) {
    if (tersimpan.length) await supabase.storage.from(BUCKET).remove(tersimpan);
    throw error;
  }
}

function pesanGagal(aksi, error) {
  console.error(`Gagal ${aksi} produk:`, error.message);
  return `Produk gagal ${aksi}. Pastikan migrasi 001, 002, dan 003 serta bucket produk sudah tersedia.`;
}

function segarkanProduk(id) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/sitemap.xml");
  if (id) revalidatePath(`/produk/${id}`);
}

export async function tambahProduk(_state, formData) {
  const { user, supabase } = await pastikanAdminAktif();
  const hasil = bacaProduk(formData);
  const files = formData.getAll("foto");
  try {
    for (const file of files) await validasiFoto(file);
  } catch (error) {
    hasil.errors.foto = error.message;
  }
  if (Object.keys(hasil.errors).length) return { errors: hasil.errors, nilai: hasil.nilai };

  const { data: produk, error } = await supabase
    .from("produk")
    .insert({
      nama: hasil.nilai.nama,
      harga: hasil.harga,
      harga_diskon: hasil.hargaDiskon,
      kategori: hasil.nilai.kategori,
      foto_url: hasil.nilai.foto_url || FOTO_CADANGAN,
      deskripsi: hasil.nilai.deskripsi || null,
      stok: hasil.stok,
      badge: hasil.nilai.badge || null,
      aktif: true,
      urutan: 0,
    })
    .select("id")
    .single();
  if (error) return { errors: { form: pesanGagal("disimpan", error) }, nilai: hasil.nilai };

  try {
    const paths = await unggahFoto(supabase, produk.id, files);
    if (paths[0]) {
      const url = supabase.storage.from(BUCKET).getPublicUrl(paths[0]).data.publicUrl;
      await supabase.from("produk").update({ foto_url: url }).eq("id", produk.id);
    }
  } catch (errorUpload) {
    await supabase.from("produk").delete().eq("id", produk.id);
    return { errors: { foto: pesanGagal("menyimpan foto", errorUpload) }, nilai: hasil.nilai };
  }

  await catatLog(user, { aksi: "tambah_produk", entitas: "produk", entitasId: produk.id, detail: { nama: hasil.nilai.nama } });
  segarkanProduk(produk.id);
  redirect("/admin");
}

export async function ubahProduk(id, _state, formData) {
  const { user, supabase } = await pastikanAdminAktif();
  const hasil = bacaProduk(formData);
  const files = formData.getAll("foto");
  if (!id) hasil.errors.form = "Produk tidak ditemukan.";
  try {
    for (const file of files) await validasiFoto(file);
  } catch (error) {
    hasil.errors.foto = error.message;
  }
  if (Object.keys(hasil.errors).length) return { errors: hasil.errors, nilai: hasil.nilai };

  const perubahan = {
    nama: hasil.nilai.nama,
    harga: hasil.harga,
    harga_diskon: hasil.hargaDiskon,
    kategori: hasil.nilai.kategori,
    foto_url: hasil.nilai.foto_url || FOTO_CADANGAN,
    deskripsi: hasil.nilai.deskripsi || null,
    stok: hasil.stok,
    badge: hasil.nilai.badge || null,
  };
  const { error } = await supabase.from("produk").update(perubahan).eq("id", id);
  if (error) return { errors: { form: pesanGagal("diubah", error) }, nilai: hasil.nilai };

  try {
    const paths = await unggahFoto(supabase, id, files);
    if (paths[0] && !hasil.nilai.foto_url) {
      perubahan.foto_url = supabase.storage.from(BUCKET).getPublicUrl(paths[0]).data.publicUrl;
      await supabase.from("produk").update({ foto_url: perubahan.foto_url }).eq("id", id);
    }
  } catch (errorUpload) {
    return { errors: { foto: pesanGagal("menyimpan foto", errorUpload) }, nilai: hasil.nilai };
  }

  await catatLog(user, { aksi: "ubah_produk", entitas: "produk", entitasId: id, detail: { nama: hasil.nilai.nama } });
  segarkanProduk(id);
  redirect("/admin");
}

export async function hapusProduk(formData) {
  const { user, supabase } = await pastikanAdminAktif();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin?status=produk-tidak-ditemukan");
  const { data: foto } = await supabase.from("foto_produk").select("storage_path").eq("produk_id", id);
  const { data: produk } = await supabase.from("produk").select("nama").eq("id", id).maybeSingle();
  const { error } = await supabase.from("produk").delete().eq("id", id);
  if (error) redirect("/admin?status=gagal-hapus");
  const paths = (foto || []).map((item) => item.storage_path);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
  await catatLog(user, { aksi: "hapus_produk", entitas: "produk", entitasId: id, detail: { nama: produk?.nama } });
  segarkanProduk(id);
  redirect("/admin");
}

export async function aturAktifProduk(formData) {
  const { user, supabase } = await pastikanAdminAktif();
  const id = String(formData.get("id") ?? "");
  const aktif = String(formData.get("aktif")) === "true";
  if (!id) redirect("/admin?status=gagal-status");
  const { error } = await supabase.from("produk").update({ aktif }).eq("id", id);
  if (error) redirect("/admin?status=gagal-status");
  await catatLog(user, { aksi: aktif ? "aktifkan_produk" : "nonaktifkan_produk", entitas: "produk", entitasId: id });
  segarkanProduk(id);
  redirect("/admin");
}

export async function geserProduk(formData) {
  const { user, supabase } = await pastikanAdminAktif();
  const id = String(formData.get("id") ?? "");
  const arah = String(formData.get("arah") ?? "");
  if (!id || !["naik", "turun"].includes(arah)) redirect("/admin?status=gagal-urutan");
  const { data: daftar, error } = await supabase
    .from("produk")
    .select("id, urutan")
    .order("urutan", { ascending: true })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });
  if (error) redirect("/admin?status=gagal-urutan");
  const index = daftar.findIndex((item) => String(item.id) === id);
  const indexLain = arah === "naik" ? index - 1 : index + 1;
  if (index < 0 || !daftar[indexLain]) redirect("/admin");
  const urutanBaru = [...daftar];
  [urutanBaru[index], urutanBaru[indexLain]] = [urutanBaru[indexLain], urutanBaru[index]];
  const hasil = await Promise.all(
    urutanBaru
      .map((item, posisi) => (item.urutan === posisi ? null : supabase.from("produk").update({ urutan: posisi }).eq("id", item.id)))
      .filter(Boolean)
  );
  if (hasil.some((item) => item.error)) redirect("/admin?status=gagal-urutan");
  await catatLog(user, { aksi: `${arah}_produk`, entitas: "produk", entitasId: id });
  segarkanProduk(id);
  redirect("/admin");
}
