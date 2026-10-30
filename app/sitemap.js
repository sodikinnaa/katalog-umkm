import { supabasePublik } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const baseUrl = (process.env.SITE_URL || "https://katalog-umkm-sodikina.vercel.app").replace(/\/$/, "");

export default async function sitemap() {
  const supabase = supabasePublik();
  const [produk, kategori] = await Promise.all([
    supabase.from("produk").select("id, created_at").eq("aktif", true).order("urutan").order("created_at", { ascending: false }),
    supabase.from("kategori").select("slug, created_at").order("nama"),
  ]);
  if (produk.error || kategori.error) {
    console.error("Gagal membuat sitemap:", (produk.error || kategori.error).message);
    return [{ url: baseUrl, changeFrequency: "daily", priority: 1 }];
  }
  return [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/tentang`, changeFrequency: "monthly", priority: 0.5 },
    ...kategori.data.map((item) => ({ url: `${baseUrl}/kategori/${item.slug}`, lastModified: item.created_at, changeFrequency: "weekly", priority: 0.7 })),
    ...produk.data.map((item) => ({ url: `${baseUrl}/produk/${item.id}`, lastModified: item.created_at, changeFrequency: "weekly", priority: 0.8 })),
  ];
}
