import { getAllPosts, SITE_URL } from "@/lib/writings";

export const dynamic = "force-static";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const items = getAllPosts()
    .filter((p) => !p.draft)
    .map((p) => {
      const url = `${SITE_URL}/writings/${p.slug.join("/")}`;
      return `<item><title>${esc(p.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><category>${esc(p.section)}</category><description>${esc(p.description)}</description></item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Prateek Singh's Writings</title><link>${SITE_URL}/writings</link><description>Tech, thoughts and life.</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
