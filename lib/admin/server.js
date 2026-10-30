import { redirect } from "next/navigation";
import { supabasePublik, supabaseSesi } from "@/lib/supabase/server";

export function galatTabel(tabel, error) {
  return new Error(
    `Gagal mengakses tabel ${tabel}. Pastikan migrasi admin_profile dan log_aktivitas sudah dijalankan. (${error.message})`
  );
}

export async function pastikanAdminAktif() {
  const supabase = await supabaseSesi();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profil, error } = await supabasePublik()
    .from("admin_profile")
    .select("user_id, nama, aktif")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw galatTabel("admin_profile", error);
  }

  if (!profil?.aktif) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=nonaktif");
  }

  return { user, profil, supabase };
}

export async function catatLog(aktor, { aksi, entitas, entitasId = null, detail = null }) {
  const { error } = await supabasePublik()
    .from("log_aktivitas")
    .insert({
      admin_id: aktor.id,
      aksi,
      entitas,
      entitas_id: entitasId == null ? null : String(entitasId),
      detail: detail ?? {},
    });

  if (error) {
    console.error(`Gagal mencatat log "${aksi}": ${error.message}`);
  }

  return !error;
}
