import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/writings";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/e-read"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
