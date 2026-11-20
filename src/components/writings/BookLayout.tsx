import Image from "next/image";
import Link from "next/link";
import { statusLabel, type Book } from "@/lib/books";
import { formatDate, postHref } from "@/lib/writings";
import { Chip, Crumbs, type Crumb } from "./parts";

/** A book's landing page: title, description, status and its published chapters in reading order. */
export default function BookLayout({ book, crumbs }: { book: Book; crumbs: Crumb[] }) {
  const first = book.chapters[0];
  const latest = [...book.chapters].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  const dates = `started ${formatDate(book.started, "month")}${book.updated.slice(0, 7) !== book.started.slice(0, 7) ? ` · updated ${formatDate(book.updated, "month")}` : ""}`;

  return (
    <>
      {/* ---------- dark and light ---------- */}
      <main className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8 paper:hidden">
        <section className="flex flex-wrap items-end gap-x-14 gap-y-10 border-b border-border pb-12 pt-10 md:pb-16 md:pt-16">
          <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-5 md:gap-6">
            <Crumbs crumbs={crumbs} />
            <div className="font-mono text-sm text-brand-text">book · {book.section}</div>
            <h1 className="max-w-[18ch] font-display text-5xl font-semibold leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-[80px]">{book.title}</h1>
            {book.description && <p className="max-w-[52ch] font-read text-lg leading-normal text-muted-foreground md:text-[22px]">{book.description}</p>}
            <div className="flex flex-wrap items-center gap-2.5 font-mono text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-2.5 border border-border py-1 pl-1 pr-3 text-foreground">
                <span aria-hidden="true" className="inline-flex h-7 w-7 items-center justify-center border border-border bg-card text-[11px] text-brand-text">PS</span>
                Prateek Singh
              </span>
              <Chip>{book.chapters.length} {book.chapters.length === 1 ? "chapter" : "chapters"}</Chip>
              <Chip>{book.readMinutes} min total</Chip>
              <span className={`border px-3 py-1 ${book.status === "complete" ? "border-border" : "border-brand text-brand-text"}`}>
                {book.status === "complete" ? "complete" : "in progress"}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link href={postHref(first)} className="inline-flex min-h-12 items-center gap-2.5 bg-brand px-5 text-[15px] font-semibold text-brand-foreground hover:opacity-90">
                Start reading <span aria-hidden="true">→</span>
              </Link>
              {book.chapters.length > 1 && latest !== first && (
                <Link href={postHref(latest)} className="inline-flex min-h-12 items-center border border-border px-5 text-[15px] hover:border-brand-text">
                  Latest: {latest.title}
                </Link>
              )}
            </div>
          </div>
          {book.cover && (
            <div className="w-full flex-[1_1_280px] md:max-w-[360px]">
              <Image src={book.cover} alt="" width={720} height={960} sizes="(min-width: 768px) 360px, 100vw" className="aspect-[3/4] w-full border border-border object-cover" />
            </div>
          )}
        </section>

        <section aria-labelledby="chapters" className="flex flex-col pt-12 md:pt-16">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="chapters" className="font-display text-[26px] font-semibold tracking-[-0.02em] md:text-[32px]">Chapters</h2>
            <span className="font-mono text-[13px] text-subtle">{dates}</span>
          </div>
          <ol className="flex flex-col">
            {book.chapters.map((c, i) => (
              <li key={c.slug.join("/")}>
                <Link href={postHref(c)} className="flex flex-wrap gap-x-8 gap-y-1.5 border-b border-border py-6 hover:text-brand-text">
                  <span className="w-10 flex-none font-mono text-sm text-subtle">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex min-w-0 flex-[999_1_320px] flex-col gap-1.5">
                    <span className="font-display text-2xl font-semibold leading-tight md:text-[26px]">{c.title}</span>
                    {c.description && <span className="text-muted-foreground">{c.description}</span>}
                  </span>
                  <span className="flex-[1_1_160px] font-mono text-[13px] text-subtle md:text-right">
                    {formatDate(c.date, "short")} · {c.readMinutes} min
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="mt-6 font-mono text-[13px] text-subtle">{statusLabel(book)}</p>
        </section>
      </main>

      {/* ---------- paper ---------- */}
      <main className="mx-auto hidden w-full max-w-3xl px-5 pb-24 pt-10 paper:block sm:px-8 md:pt-16">
        <div className="flex flex-col gap-2 text-center">
          <div className="text-base tracking-[0.06em] text-subtle [font-variant:small-caps]">a book · {book.section}</div>
          <h1 className="text-[34px] font-semibold leading-[1.15] sm:text-[44px]">{book.title}</h1>
          <div className="mt-2.5 text-[19px]">Prateek Singh</div>
          <div className="text-base italic text-subtle">
            {dates.charAt(0).toUpperCase() + dates.slice(1)} · {statusLabel(book)}
          </div>
        </div>
        {book.description && (
          <section aria-labelledby="p-abs" className="mx-auto mt-10 max-w-[600px] text-justify text-[17px] leading-[1.55] [hyphens:auto]">
            <span id="p-abs" className="mb-1.5 block text-center font-bold">Abstract</span>
            {book.description}
          </section>
        )}
        <nav aria-labelledby="p-contents" className="mt-10 border-y border-border border-t-foreground py-3.5 text-[17px]">
          <div id="p-contents" className="mb-1.5 font-bold">Contents</div>
          <ol className="grid list-none gap-1">
            {book.chapters.map((c, i) => (
              <li key={c.slug.join("/")} className="flex items-baseline justify-between gap-4">
                <Link href={postHref(c)} className="text-brand-text">
                  Chapter {i + 1}&nbsp;&nbsp;{c.title}
                </Link>
                <span className="flex-none text-base text-subtle">{c.readMinutes} min</span>
              </li>
            ))}
          </ol>
        </nav>
        <p className="mt-6 text-center">
          <Link href={postHref(first)} className="italic text-brand-text">Begin with Chapter 1 →</Link>
        </p>
      </main>
    </>
  );
}
