import { supabaseSesi } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const KOLOM = ["id", "nama", "harga", "kategori", "deskripsi", "foto_url", "created_at"];

function selCsv(nilai) {
  if (nilai === null || nilai === undefined) return "";
  let s = String(nilai);
  if (typeof nilai === "string" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) || s !== String(nilai) ? `"${s.replace(/"/g, '""')}"` : s;
}

function buatCsv(baris) {
  const isi = [KOLOM.join(","), ...baris.map((b) => KOLOM.map((k) => selCsv(b[k])).join(","))];
  return "\uFEFF" + isi.join("\r\n") + "\r\n";
}

export async function GET() {
  const supabase = await supabaseSesi();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Silakan masuk sebagai admin terlebih dahulu.", {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const { data, error } = await supabase
    .from("produk")
    .select(KOLOM.join(", "))
    .order("created_at", { ascending: false });

  if (error) {
    return new Response("Gagal mengambil produk. Coba lagi beberapa saat.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  return new Response(buatCsv(data || []), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="produk.csv"',
      "Cache-Control": "no-store",
    },
  });
}
