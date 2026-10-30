import NavAdmin from "@/components/NavAdmin";
import { galatTabel, pastikanAdminAktif } from "@/lib/admin/server";
import { supabasePublik } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanLog() {
  await pastikanAdminAktif();
  const { data: daftarLog, error } = await supabasePublik()
    .from("log_aktivitas")
    .select("id, admin_id, aksi, entitas, entitas_id, detail, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw galatTabel("log_aktivitas", error);
  const adminIds = [...new Set(daftarLog.map((log) => log.admin_id).filter(Boolean))];
  const { data: profil } = adminIds.length
    ? await supabasePublik().from("admin_profile").select("user_id, email, nama").in("user_id", adminIds)
    : { data: [] };
  const namaAdmin = new Map((profil || []).map((item) => [item.user_id, item.nama || item.email || item.user_id]));

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Log aktivitas</h1>
        <p className="mt-1 text-sm text-teks-lembut">50 aktivitas admin terakhir.</p>
      </div>
      {daftarLog.length === 0 ? (
        <p className="rounded-2xl border border-garis bg-permukaan p-6 text-teks-lembut">Belum ada aktivitas.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-garis">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-permukaan text-teks-lembut">
              <tr><th className="px-4 py-3 font-semibold">Waktu</th><th className="px-4 py-3 font-semibold">Admin</th><th className="px-4 py-3 font-semibold">Aksi</th><th className="px-4 py-3 font-semibold">Data</th></tr>
            </thead>
            <tbody>
              {daftarLog.map((log) => (
                <tr key={log.id} className="border-t border-garis align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-teks-lembut">{new Date(log.created_at).toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3">{namaAdmin.get(log.admin_id) || "Sistem"}</td>
                  <td className="px-4 py-3 font-semibold">{log.aksi}</td>
                  <td className="px-4 py-3 text-teks-lembut">{log.entitas}{log.entitas_id ? ` #${log.entitas_id}` : ""}{log.detail && <pre className="mt-1 max-w-sm whitespace-pre-wrap break-words font-sans text-xs">{JSON.stringify(log.detail)}</pre>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
