import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { supabasePublik } from "@/lib/supabase/server";

export async function POST(request) {
  let data;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }

  const produkId = Number(data?.produk_id);
  if (!Number.isInteger(produkId) || produkId < 1) {
    return NextResponse.json({ error: "Produk tidak valid." }, { status: 400 });
  }

  const alamat = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "tidak-diketahui";
  const kunci = createHash("sha256")
    .update(`${alamat}:${process.env.SUPABASE_SECRET_KEY}`)
    .digest("hex");
  const supabase = supabasePublik();
  const { data: diizinkan, error: errorBatas } = await supabase.rpc("ambil_jatah_kiriman", {
    p_jenis: "klik_whatsapp",
    p_kunci: kunci,
    p_maks: 60,
    p_detik: 3600,
  });

  if (errorBatas) return NextResponse.json({ error: "Pencatatan gagal." }, { status: 500 });
  if (!diizinkan) return new NextResponse(null, { status: 204 });

  const { error } = await supabase.from("klik_whatsapp").insert({ produk_id: produkId });
  if (error) return NextResponse.json({ error: "Pencatatan gagal." }, { status: 500 });

  return new NextResponse(null, { status: 204 });
}
