import { createHash } from "node:crypto";
import { supabasePublik } from "@/lib/supabase/server";

const MAKS_KUNCI_MEMORI = 5000;
const kiriman = globalThis.__rateLimitMemori ?? new Map();
globalThis.__rateLimitMemori = kiriman;

export function kunciPengunjung(prefix, headersList) {
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip")?.trim() ||
    "tanpa-ip";
  return createHash("sha256").update(`${prefix}:${ip}`).digest("hex");
}

function batasMemori(jenis, kunci, maks, detik) {
  const id = `${jenis}:${kunci}`;
  const sekarang = Date.now();
  const daftar = (kiriman.get(id) ?? []).filter((waktu) => sekarang - waktu < detik * 1000);
  if (daftar.length >= maks) return false;
  daftar.push(sekarang);
  kiriman.set(id, daftar);
  if (kiriman.size > MAKS_KUNCI_MEMORI) kiriman.delete(kiriman.keys().next().value);
  return true;
}

export async function bolehKirim({ jenis, kunci, maks, detik }) {
  const { data, error } = await supabasePublik().rpc("ambil_jatah_kiriman", {
    p_jenis: jenis,
    p_kunci: kunci,
    p_maks: maks,
    p_detik: detik,
  });
  return error ? batasMemori(jenis, kunci, maks, detik) : Boolean(data);
}
