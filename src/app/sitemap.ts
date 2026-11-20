import type { MetadataRoute } from "next";
import { getAllPosts, postHref, SITE_URL } from "@/lib/writings";

// Built from the posts on every build, so it can't go stale. Drafts are left out.
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().filter((p) => !p.draft);
  const latest = posts[0]?.modifiedDate ?? posts[0]?.date;
  return [
    { url: SITE_URL, lastModified: latest, priority: 1 },
    { url: `${SITE_URL}/writings`, lastModified: latest, priority: 0.9 },
    ...posts.map((p) => ({ url: `${SITE_URL}${postHref(p)}`, lastModified: p.modifiedDate ?? p.date, priority: 0.8 })),
  ];
}
