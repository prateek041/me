import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  formatDate,
  getAllPosts,
  getHeaderImage,
  getPostNumbers,
  getSeriesList,
  postHref,
  prettify,
  type PostMeta,
} from "@/lib/writings";
import { bookHref, getBooks } from "@/lib/books";

export const metadata: Metadata = {
  title: "Writings",
  description: "Tech, thoughts and life. Deep dives into eBPF, Linux networking and Kubernetes.",
};

const SECTIONS = ["tech", "thoughts", "life"] as const;
const wrap = "mx-auto w-full max-w-6xl px-5 sm:px-8";

function groupByYear(posts: PostMeta[]) {
  const map = new Map<number, PostMeta[]>();
  for (const p of posts) {
    const y = new Date(p.date).getUTCFullYear();
    map.set(y, [...(map.get(y) ?? []), p]);
  }
  return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
}

type ChapterInfo = Map<string, { book: string; n: number }>;

/** "life · a sample book · ch. 2 · ..." for chapters, "tech · ebpf · ..." for series posts. */
const metaLine = (p: PostMeta, chapters: ChapterInfo) => {
  const ch = chapters.get(p.slug.join("/"));
  const group = ch ? ` · ${ch.book.toLowerCase()} · ch. ${ch.n}` : p.slug.length > 2 ? ` · ${prettify(p.slug[1]).toLowerCase()}` : "";
  return `${p.section}${group} · ${formatDate(p.date, "long")} · ${p.readMinutes} min`;
};

export default function WritingsPage({ searchParams }: { searchParams: { section?: string } }) {
  const all = getAllPosts().filter((p) => !p.draft);
  const section = SECTIONS.find((s) => s === searchParams.section);
  const shown = section ? all.filter((p) => p.section === section) : all;
  const years = groupByYear(shown);
  const featured = all[0];
  const featuredImage = featured ? getHeaderImage(featured) : null;
  const series = getSeriesList();
  const books = getBooks();
  const chapters: ChapterInfo = new Map(books.flatMap((b) => b.chapters.map((c, i) => [c.slug.join("/"), { book: b.title, n: i + 1 }] as const)));
  const numbers = getPostNumbers();
  const since = new Date(all[all.length - 1].date).getUTCFullYear();
  const until = new Date(all[0].date).getUTCFullYear();
  const count = (s: string) => all.filter((p) => p.section === s).length;

  const filters = [
    { id: undefined, label: "all", n: all.length },
    ...SECTIONS.map((s) => ({ id: s, label: s, n: count(s) })).filter((f) => f.n > 0),
  ];

  return (
    <>
      {/* ---------- dark and light ---------- */}
      <main className={`${wrap} pb-24 paper:hidden`}>
        <section className="flex flex-wrap items-end justify-between gap-8 pb-10 pt-12 md:pb-14 md:pt-[88px]">
          <div className="flex flex-[1_1_480px] flex-col gap-5">
            <div className="font-mono text-sm text-subtle">writings / {all.length} posts since {since}</div>
            <h1 className="font-display text-5xl font-semibold leading-[0.98] tracking-[-0.035em] sm:text-7xl lg:text-[88px]">
              Tech, thoughts<br />and life.
            </h1>
            <p className="max-w-[52ch] text-lg text-muted-foreground">
              Deep dives into eBPF, Linux networking and Kubernetes, next to the things I think about when I am not at a terminal.
            </p>
          </div>
          <a href="/writings/rss.xml" className="inline-flex min-h-11 items-center gap-2.5 border border-border px-4 font-mono text-sm hover:border-brand-text">
            RSS feed
          </a>
        </section>

        {featured && (
          <Link href={postHref(featured)} className="flex flex-wrap gap-x-14 gap-y-8 border border-brand bg-card p-6 hover:opacity-95 md:p-10">
            <div className="flex min-w-0 flex-[999_1_400px] flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3 font-mono text-[13px]">
                <span className="bg-brand px-2.5 py-0.5 font-medium text-brand-foreground">latest</span>
                <span className="text-muted-foreground">{featured.section}</span>
                <span className="text-subtle">{formatDate(featured.date, "month")} · {featured.readMinutes} min read</span>
              </div>
              <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.025em] md:text-[56px]">{featured.title}</h2>
              {featured.description && <p className="max-w-[52ch] text-lg text-muted-foreground">{featured.description}</p>}
              <span className="font-mono text-sm">read the post →</span>
            </div>
            {featuredImage && (
              <div className="relative min-h-[220px] flex-[1_1_300px]">
                <Image src={featuredImage} alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
              </div>
            )}
          </Link>
        )}

        {books.length > 0 && (
          <section aria-labelledby="books" className="flex flex-col gap-6 pt-14 md:pt-[72px]">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="books" className="font-display text-[26px] font-semibold tracking-[-0.02em] md:text-[32px]">Books</h2>
              <span className="font-mono text-[13px] text-subtle">written a chapter at a time</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((b) => (
                <Link key={b.id} href={bookHref(b)} className="flex flex-col gap-2 border border-border bg-card p-6 hover:border-brand-text">
                  <div className="font-mono text-[13px] text-brand-text">book · {b.section}</div>
                  <div className="font-display text-2xl font-semibold leading-tight">{b.title}</div>
                  {b.description && <div className="line-clamp-2 text-[15px] text-muted-foreground">{b.description}</div>}
                  <div className="mt-auto pt-2 text-sm text-subtle">
                    {b.chapters.length} {b.chapters.length === 1 ? "chapter" : "chapters"} · {b.status === "complete" ? "complete" : "in progress"} · updated {formatDate(b.updated, "month")}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {series.length > 0 && (
          <section aria-labelledby="series" className="flex flex-col gap-6 pb-6 pt-14 md:pt-[72px]">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="series" className="font-display text-[26px] font-semibold tracking-[-0.02em] md:text-[32px]">Series</h2>
              <span className="font-mono text-[13px] text-subtle">folders under tech/ become series</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {series.map((s) => (
                <Link key={s.id} href={s.href} className="flex flex-col gap-2 border border-border p-5 hover:border-brand-text">
                  <div className="font-mono text-[13px] text-brand-text">{s.id}</div>
                  <div className="font-display text-[22px] font-semibold">{s.title}</div>
                  <div className="text-sm text-subtle">{s.count} posts · {formatDate(s.first, "month")}{s.first.slice(0, 7) === s.last.slice(0, 7) ? "" : ` – ${formatDate(s.last, "month")}`}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="all" className="flex flex-col pt-12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground/30 pb-5">
            <h2 id="all" className="font-display text-[26px] font-semibold tracking-[-0.02em] md:text-[32px]">All posts</h2>
            <div role="group" aria-label="Filter by section" className="flex flex-wrap gap-2 font-mono text-[13px]">
              {filters.map((f) => {
                const active = f.id === section;
                return (
                  <Link
                    key={f.label}
                    href={f.id ? `/writings?section=${f.id}` : "/writings"}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center border px-3.5 ${active ? "border-brand-text text-brand-text" : "border-border text-muted-foreground hover:text-foreground"}`}
                  >
                    {f.label} {f.n}
                  </Link>
                );
              })}
            </div>
          </div>
          {years.map(([year, posts]) => (
            <div key={year}>
              <div className="pb-2 pt-9 font-mono text-[13px] text-subtle">{year}</div>
              {posts.map((p) => (
                <Link key={p.slug.join("/")} href={postHref(p)} className="flex flex-wrap items-baseline gap-x-7 gap-y-1.5 border-b border-border py-[18px] hover:text-brand-text">
                  <div className="w-[110px] flex-none font-mono text-[13px] text-subtle">{formatDate(p.date, "day")}</div>
                  <div className="flex min-w-0 flex-[999_1_320px] flex-col gap-1">
                    {chapters.has(p.slug.join("/")) && (
                      <div className="font-mono text-[13px] text-brand-text">
                        {chapters.get(p.slug.join("/"))!.book} · chapter {chapters.get(p.slug.join("/"))!.n}
                      </div>
                    )}
                    <div className="font-display text-[22px] font-semibold leading-tight">{p.title}</div>
                    {p.description && <div className="text-[15px] text-muted-foreground">{p.description}</div>}
                  </div>
                  <div className="flex gap-4 font-mono text-[13px] text-subtle"><span>{p.section}</span><span>{p.readMinutes} min</span></div>
                </Link>
              ))}
            </div>
          ))}
        </section>
      </main>

      {/* ---------- paper ---------- */}
      <main className="mx-auto hidden w-full max-w-3xl px-5 pb-24 pt-10 paper:block sm:px-8 md:pt-[72px]">
        <div className="flex flex-col gap-2.5 text-center">
          <h1 className="text-[34px] font-semibold leading-[1.15] md:text-[44px]">Writings</h1>
          <div className="text-lg tracking-[0.05em] text-subtle [font-variant:small-caps]">
            tech, thoughts and life · {all.length} entries · {since}–{until}
          </div>
        </div>

        <section className="mx-auto mt-12 max-w-[600px] text-justify text-[17px] leading-[1.55] [hyphens:auto]">
          <span className="font-bold">About.</span> Deep dives into eBPF, Linux networking and Kubernetes, next to the things I think about when I am not at a terminal. Entries are listed newest first and numbered in order of publication.
        </section>

        <div className="mt-10 flex flex-wrap gap-x-5 gap-y-1.5 border-y border-border border-t-foreground py-3 text-[17px]">
          <span className="italic text-subtle">Show:</span>
          {filters.map((f) => (
            <Link
              key={f.label}
              href={f.id ? `/writings?section=${f.id}` : "/writings"}
              className={`text-brand-text ${f.id === section ? "font-bold" : ""}`}
            >
              {f.label} ({f.n})
            </Link>
          ))}
        </div>

        {books.length > 0 && (
          <section aria-labelledby="p-books" className="mt-10">
            <h2 id="p-books" className="mb-3 text-xl font-bold">Books</h2>
            <ol className="flex list-none flex-col gap-1 text-lg">
              {books.map((b) => (
                <li key={b.id}>
                  <Link href={bookHref(b)} className="text-brand-text">{b.title}</Link>{" "}
                  <span className="text-subtle">· {b.chapters.length} {b.chapters.length === 1 ? "chapter" : "chapters"}, {b.status === "complete" ? "complete" : "in progress"}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {series.length > 0 && (
          <section aria-labelledby="p-col" className="mt-10">
            <h2 id="p-col" className="mb-3 text-xl font-bold">Collections</h2>
            <ol className="flex list-none flex-col gap-1 text-lg">
              {series.map((s) => (
                <li key={s.id}>
                  <Link href={s.href} className="text-brand-text">{s.title}</Link>{" "}
                  <span className="text-subtle">· {s.count} entries, {formatDate(s.first, "month")}{s.first.slice(0, 7) === s.last.slice(0, 7) ? "" : ` to ${formatDate(s.last, "month")}`}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {years.map(([year, posts]) => (
          <section key={year} aria-label={String(year)} className="mt-12">
            <h2 className="border-b border-border pb-1.5 text-xl font-bold">{year}</h2>
            {posts.map((p) => (
              <Link key={p.slug.join("/")} href={postHref(p)} className="grid grid-cols-[52px_minmax(0,1fr)] gap-x-2 border-b border-border/60 py-3.5">
                <span className="font-mono text-[13px] leading-7 text-subtle">[{numbers.get(p.slug.join("/"))}]</span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-xl font-semibold leading-snug">{p.title}</span>
                  {p.description && <span className="text-[17px] italic text-muted-foreground">{p.description}</span>}
                  <span className="text-base tracking-[0.04em] text-subtle [font-variant:small-caps]">{metaLine(p, chapters)}</span>
                </span>
              </Link>
            ))}
          </section>
        ))}
      </main>
    </>
  );
}
