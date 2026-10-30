import { supabasePublik } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const baseUrl = (process.env.SITE_URL || "https://katalog-umkm-sodikina.vercel.app").replace(/\/$/, "");

export default async function sitemap() {
  const { data: daftarProduk, error } = await supabasePublik().from("produk").select("id, created_at");

  if (error) {
    throw new Error(`Gagal membuat sitemap: ${error.message}`);
  }

  return [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/tentang`, changeFrequency: "monthly", priority: 0.5 },
    ...daftarProduk.map((produk) => ({
      url: `${baseUrl}/produk/${produk.id}`,
      lastModified: produk.created_at,
      changeFrequency: "weekly",
      priority: 0.8,
    })),
  ];
}
