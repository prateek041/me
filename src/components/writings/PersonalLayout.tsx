import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import { formatDate, postHref, type PostMeta } from "@/lib/writings";
import ReadingProgress from "./ReadingProgress";
import ReaderMode from "./ReaderMode";
import { AuthorCard, Crumbs, PaperNav, PrevNext, type Crumb } from "./parts";

export interface MorePost {
  meta: PostMeta;
  image: string | null;
  number: number;
}

interface Props {
  meta: PostMeta;
  Content: ComponentType;
  crumbs: Crumb[];
  image: string | null;
  prev?: PostMeta;
  next?: PostMeta;
  more: MorePost[];
  /** Set when this post is a chapter of a book. */
  book?: { title: string; href: string; index: number; total: number };
}

/** Thoughts and life posts: a serif reading column; the header image stays put while the text slides over it. */
export default function PersonalLayout({ meta, Content, crumbs, image, prev, next, more, book }: Props) {
  const chip = "border border-border px-3 py-1";
  return (
    <>
      <ReadingProgress />
      <ReaderMode />

      <header className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-5 pb-8 pt-10 text-center sm:px-8 md:pb-10 md:pt-20 paper:gap-2 paper:pb-0 paper:pt-10 md:paper:pt-16">
        {book ? (
          <>
            {/* Like the running head of a printed book: the book's title, then the chapter number. */}
            <Link href={book.href} className="mb-3 text-[15px] tracking-[0.12em] text-subtle [font-variant:small-caps] hover:text-brand-text md:mb-6">
              {book.title}
            </Link>
            {/* sits close to the title it numbers */}
            <div className="-mb-3 font-read text-lg italic text-muted-foreground">Chapter {book.index + 1}</div>
          </>
        ) : (
          <>
            <div data-chrome><Crumbs crumbs={crumbs} className="paper:hidden" /></div>
            <div className="hidden text-base tracking-[0.06em] text-subtle paper:block [font-variant:small-caps]">{meta.section} · essay</div>
          </>
        )}
        <h1 className="font-read text-5xl font-semibold leading-none tracking-[-0.025em] sm:text-7xl lg:text-[92px] paper:font-sans paper:text-[34px] paper:leading-[1.15] paper:tracking-normal sm:paper:text-[44px]">
          {meta.title}
        </h1>
        {meta.description && (
          <p className={`max-w-[40ch] font-read text-xl italic leading-normal text-muted-foreground md:text-[23px] paper:hidden ${book ? "mt-2" : ""}`}>{meta.description}</p>
        )}
        <div className={`flex flex-wrap items-center justify-center gap-2.5 font-mono text-[13px] text-muted-foreground paper:hidden ${book ? "hidden" : ""}`}>
          <span className="inline-flex items-center gap-2.5 border border-border py-1 pl-1 pr-3 text-foreground">
            <span aria-hidden="true" className="inline-flex h-7 w-7 items-center justify-center border border-border bg-card text-[11px] text-brand-text">PS</span>
            Prateek Singh
          </span>
          <span className={chip}>{formatDate(meta.date, "long")}</span>
          <span className={chip}>{meta.readMinutes} min read</span>
          {meta.draft && <span className="border border-amber-500/60 px-3 py-1 text-amber-500">draft</span>}
        </div>
        {/* paper byline and abstract */}
        {!book && (
          <>
            <div className="mt-2.5 hidden text-[19px] paper:block">Prateek Singh</div>
            <div className="hidden text-base italic text-subtle paper:block">{formatDate(meta.date, "long")} · {meta.readMinutes} min read</div>
          </>
        )}
        {meta.description && (
          <section aria-labelledby="abs" className="mx-auto mt-6 hidden max-w-[560px] text-[17px] leading-[1.55] paper:block">
            <span id="abs" className="mb-1 block font-bold">Abstract</span>
            <span className="italic">{meta.description}</span>
          </section>
        )}
      </header>

      <div className="relative">
        {image && (
          <figure className="sticky top-[calc(var(--nav-h)+1.5rem)] z-0 mx-auto w-full max-w-6xl px-5 sm:px-8 paper:static paper:mt-10 paper:max-w-3xl">
            <Image
              src={image}
              alt={meta.title}
              width={1600}
              height={900}
              priority
              sizes="(min-width: 1152px) 1100px, 100vw"
              className="h-[240px] w-full object-cover md:h-[600px] paper:aspect-video paper:h-auto"
            />
            <figcaption className="mt-2 hidden text-center text-base paper:block">
              <span className="font-bold">Figure 1:</span> <span className="text-muted-foreground">Header illustration for this essay.</span>
            </figcaption>
          </figure>
        )}
        <div className={`relative z-10 mx-auto w-full max-w-[63.5rem] px-2 sm:px-4 paper:mt-10 paper:max-w-[51rem] paper:px-5 ${image ? "-mt-10 md:-mt-56" : ""}`}>
          <article className="border border-border bg-card px-5 pb-16 pt-10 md:px-20 md:pb-24 md:pt-16 paper:border-0 paper:bg-transparent paper:px-0 paper:pb-0 paper:pt-0">
            <div className="prose prose-lg post post-personal md:prose-xl">
              <Content />
            </div>
            <div data-chrome className="paper:hidden">
              <div className="mt-12 text-center font-mono text-sm tracking-[0.5em] text-subtle" aria-hidden="true">· · ·</div>
              {!book && <AuthorCard />}
              <PrevNext prev={prev} next={next} prevLabel={book ? "← previous chapter" : "← older thought"} nextLabel={book ? "next chapter →" : "newer thought →"} serif />
            </div>
            <div data-chrome><PaperNav prev={prev} next={next} prevLabel={book ? `Chapter ${book.index}` : "Older"} nextLabel={book ? `Chapter ${book.index + 2}` : "Newer"} /></div>
          </article>
        </div>
      </div>

      {more.length > 0 && (
        <section data-chrome aria-labelledby="more" className="border-t border-border bg-card paper:bg-transparent">
          <div className="mx-auto w-full max-w-[1100px] px-5 py-14 sm:px-8 md:py-[72px]">
            <div className="mb-7 flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="more" className="font-read text-3xl font-semibold tracking-tight md:text-4xl paper:font-sans paper:text-[22px] paper:font-bold">
                {meta.section === "life" ? "More from life" : "More thoughts"}
              </h2>
              <Link href={`/writings?section=${meta.section}`} className="font-mono text-sm text-muted-foreground hover:text-foreground paper:hidden">
                all in {meta.section} →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 paper:hidden">
              {more.map(({ meta: m, image: img }) => (
                <Link key={m.slug.join("/")} href={postHref(m)} className="flex flex-col gap-4 hover:text-brand-text">
                  {img && <Image src={img} alt="" width={900} height={600} sizes="(min-width: 640px) 45vw, 100vw" className="h-[200px] w-full object-cover md:h-[260px]" />}
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[13px] text-subtle">{formatDate(m.date, "long")} · {m.readMinutes} min</span>
                    <span className="font-read text-[26px] font-semibold leading-tight">{m.title}</span>
                    {m.description && <span className="font-read text-lg italic text-muted-foreground">{m.description}</span>}
                  </div>
                </Link>
              ))}
            </div>
            <ol className="hidden list-none gap-2 text-[16.5px] leading-normal paper:grid">
              {more.map(({ meta: m, number }) => (
                <li key={m.slug.join("/")} className="grid grid-cols-[36px_minmax(0,1fr)]">
                  <span>[{number}]</span>
                  <span>P. Singh. <Link href={postHref(m)} className="italic text-brand-text">{m.title}</Link>. {m.description} {formatDate(m.date, "month")}.</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </>
  );
}
