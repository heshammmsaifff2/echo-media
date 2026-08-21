import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/locale";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private areas and machine endpoints — nothing here to index, and
        // crawling them wastes crawl budget on redirects to the login page.
        disallow: ["/api/", "/admin", "/dashboard", "/auth/", "/protected"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
