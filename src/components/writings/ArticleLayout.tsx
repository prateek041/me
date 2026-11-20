import Link from "next/link";
import type { ComponentType } from "react";
import { formatDate, postHref, SITE_URL, type PostMeta } from "@/lib/writings";
import ReadingProgress from "./ReadingProgress";
import TableOfContents from "./TableOfContents";
import { AuthorCard, Byline, Chip, Crumbs, PaperNav, PrevNext, type Crumb } from "./parts";

interface Props {
  meta: PostMeta;
  Content: ComponentType;
  crumbs: Crumb[];
  series: { title: string; posts: PostMeta[] } | null;
  prev?: PostMeta;
  next?: PostMeta;
}

/** Numbered contents list: 1, 2, 2.1 ... matches the CSS heading counters in the paper theme. */
function numbered(meta: PostMeta) {
  let h2 = 0;
  let h3 = 0;
  return meta.headings.map((h) => {
    if (h.depth === 2) { h2++; h3 = 0; } else { h3++; }
    return { ...h, num: h.depth === 2 ? `${h2}` : `${h2}.${h3}` };
  });
}

export default function ArticleLayout({ meta, Content, crumbs, series, prev, next }: Props) {
  const here = series?.posts.findIndex((p) => p.slug.join("/") === meta.slug.join("/")) ?? -1;
  const seriesLabel = series ? `${series.title} · part ${here + 1} of ${series.posts.length}` : meta.section;
  const toc = numbered(meta);
  const prevLabel = series ? `Part ${here}` : "Older";
  const nextLabel = series ? `Part ${here + 2}` : "Newer";

  const seriesList = series && (
    <ol className="flex flex-col gap-0.5">
      {series.posts.map((p, i) => {
        const current = i === here;
        return (
          <li key={p.slug.join("/")}>
            <Link
              href={postHref(p)}
              aria-current={current ? "page" : undefined}
              className={`flex gap-3 px-2.5 py-2 ${current ? "bg-card font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <span className={`font-mono ${current ? "text-brand-text" : "text-subtle"}`}>{String(i + 1).padStart(2, "0")}</span>
              {p.title}
            </Link>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      <ReadingProgress />

      {/* header: dark and light */}
      <section className="border-b border-border paper:hidden">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 pb-8 pt-10 sm:px-8 md:gap-[22px] md:pb-12 md:pt-16">
          <Crumbs crumbs={crumbs} />
          <h1 className="max-w-[18ch] font-display text-4xl font-semibold leading-none tracking-[-0.035em] sm:text-6xl lg:text-[76px]">{meta.title}</h1>
          {meta.description && <p className="max-w-[56ch] font-read text-lg leading-normal text-muted-foreground md:text-[22px]">{meta.description}</p>}
          <Byline meta={meta} extra={series && <Chip>{series.title} series · {here + 1} of {series.posts.length}</Chip>} />
        </div>
      </section>

      {/* header: paper */}
      <section className="mx-auto hidden w-full max-w-3xl px-5 pt-10 paper:block sm:px-8 md:pt-16">
        <div className="flex flex-col gap-2 text-center">
          <div className="text-base tracking-[0.06em] text-subtle [font-variant:small-caps]">{seriesLabel}</div>
          <h1 className="text-[32px] font-semibold leading-[1.15] sm:text-[40px]">{meta.title}</h1>
          <div className="mt-2.5 text-[19px]">Prateek Singh</div>
          <div className="text-base italic text-subtle">
            {SITE_URL.replace("https://", "")}/writings/{meta.slug.join("/")} · {formatDate(meta.date, "long")} · {meta.readMinutes} min read
          </div>
        </div>
        {meta.description && (
          <section aria-labelledby="abs" className="mx-auto mt-10 max-w-[600px] text-justify text-[17px] leading-[1.55] [hyphens:auto]">
            <span id="abs" className="mb-1.5 block text-center font-bold">Abstract</span>
            {meta.description}
          </section>
        )}
        {toc.length > 0 && (
          <nav aria-labelledby="toc" className="mt-10 border-y border-border border-t-foreground py-3.5 text-[17px]">
            <div id="toc" className="mb-1.5 font-bold">Contents</div>
            <ol className="grid list-none gap-0.5">
              {toc.map((h) => (
                <li key={h.id} className={h.depth === 3 ? "pl-7" : ""}>
                  <a href={`#${h.id}`} className="text-brand-text">{h.num}&nbsp;&nbsp;{h.text}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </section>

      {/* body */}
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-start gap-x-14 px-5 sm:px-8 paper:block paper:max-w-3xl">
        {series && (
          <>
            <details className="w-full border-b border-border py-1 text-sm lg:hidden paper:hidden">
              <summary className="flex min-h-11 cursor-pointer items-center font-mono text-[13px]">{series.title} series · part {here + 1} of {series.posts.length}</summary>
              <div className="pb-3">{seriesList}</div>
            </details>
            <aside aria-label={`${series.title} series`} className="sticky top-6 hidden w-56 shrink-0 pb-6 pt-12 text-sm lg:block paper:hidden">
              <div className="mb-3 font-mono text-[13px] text-subtle">series · {meta.slug.slice(0, 2).join("/")}</div>
              {seriesList}
            </aside>
          </>
        )}

        <article className={`min-w-0 max-w-[44rem] flex-[999_1_480px] pb-16 pt-6 md:pb-24 lg:pt-12 paper:max-w-none paper:pb-12 paper:pt-10 ${series ? "" : "lg:ml-[calc(14rem+3.5rem)] paper:ml-0"}`}>
          {meta.headings.length > 1 && (
            <details className="mb-6 border-b border-border pb-1 text-sm xl:hidden paper:hidden">
              <summary className="flex min-h-11 cursor-pointer items-center font-mono text-[13px]">On this page</summary>
              <ul className="flex flex-col pb-3">
                {meta.headings.map((h) => (
                  <li key={h.id} className={h.depth === 3 ? "pl-4" : ""}>
                    <a href={`#${h.id}`} className="block py-1.5 text-muted-foreground hover:text-foreground">{h.text}</a>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <div className="prose prose-lg post post-numbered prose-headings:font-display">
            <Content />
          </div>
          <div className="paper:hidden">
            <AuthorCard />
            <PrevNext prev={prev} next={next} prevLabel={`← ${series ? "previous" : "older"}`} nextLabel={`${series ? "next" : "newer"} →`} />
          </div>
          <PaperNav prev={prev} next={next} prevLabel={prevLabel} nextLabel={nextLabel} />
        </article>

        {meta.headings.length > 1 && (
          <aside aria-label="On this page" className="sticky top-6 hidden w-52 shrink-0 pb-6 pl-2 pt-12 xl:block paper:hidden">
            <TableOfContents headings={meta.headings} />
          </aside>
        )}
      </div>
    </>
  );
}
