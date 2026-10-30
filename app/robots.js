const baseUrl = (process.env.SITE_URL || "https://katalog-umkm-sodikina.vercel.app").replace(/\/$/, "");

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
