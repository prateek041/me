import Link from "next/link";
import type { ReactNode } from "react";
import { formatDate, postHref, type PostMeta } from "@/lib/writings";

export interface Crumb {
  label: string;
  href: string | null;
}

export function Crumbs({ crumbs, className = "" }: { crumbs: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={`font-mono text-sm text-subtle ${className}`}>
      <Link href="/writings" className="hover:text-brand-text">writings</Link>
      {crumbs.map((c) => (
        <span key={c.label}>
          {" / "}
          {c.href ? <Link href={c.href} className="hover:text-brand-text">{c.label}</Link> : c.label}
        </span>
      ))}
    </nav>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="border border-border px-3 py-1">{children}</span>;
}

export function Byline({ meta, extra }: { meta: PostMeta; extra?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 font-mono text-[13px] text-muted-foreground">
      <span className="inline-flex items-center gap-2.5 border border-border py-1 pl-1 pr-3 text-foreground">
        <span aria-hidden="true" className="inline-flex h-7 w-7 items-center justify-center border border-border bg-card text-[11px] text-brand-text">PS</span>
        Prateek Singh
      </span>
      <Chip>{formatDate(meta.date, "long")}</Chip>
      <Chip>{meta.readMinutes} min read</Chip>
      {meta.status && <Chip>{meta.status}</Chip>}
      {extra}
      {meta.draft && <span className="border border-amber-500/60 px-3 py-1 text-amber-500">draft · hidden in production</span>}
    </div>
  );
}

export function AuthorCard() {
  return (
    <div className="mt-16 flex flex-wrap items-center gap-x-5 gap-y-4 border border-border bg-card px-5 py-5">
      <span aria-hidden="true" className="inline-flex h-[52px] w-[52px] items-center justify-center border border-border font-mono text-[15px] text-brand-text">PS</span>
      <div className="min-w-0 flex-[1_1_240px]">
        <div className="font-display text-[22px] font-medium">Prateek Singh</div>
        <div className="text-sm text-subtle">Software engineer. Writes about eBPF, Linux and building products.</div>
      </div>
      <div className="flex gap-4 font-mono text-[13px] text-muted-foreground">
        <a href="https://github.com/prateek041" className="hover:text-foreground">GitHub ↗</a>
        <a href="https://x.com/prateek_0041" className="hover:text-foreground">X ↗</a>
      </div>
    </div>
  );
}

export function PrevNext({ prev, next, prevLabel, nextLabel, serif = false }: {
  prev?: PostMeta; next?: PostMeta; prevLabel: string; nextLabel: string; serif?: boolean;
}) {
  if (!prev && !next) return null;
  const title = `${serif ? "font-read" : "font-display"} text-xl font-semibold leading-snug`;
  return (
    <nav aria-label="More articles" className="mt-6 grid gap-3 sm:grid-cols-2">
      {prev ? (
        <Link href={postHref(prev)} className="flex flex-col gap-1.5 border border-border p-5 hover:border-brand-text">
          <span className="font-mono text-[13px] text-subtle">{prevLabel}</span>
          <span className={title}>{prev.title}</span>
        </Link>
      ) : <span className="hidden sm:block" />}
      {next && (
        <Link href={postHref(next)} className="flex flex-col gap-1.5 border border-border p-5 hover:border-brand-text sm:text-right">
          <span className="font-mono text-[13px] text-subtle">{nextLabel}</span>
          <span className={title}>{next.title}</span>
        </Link>
      )}
    </nav>
  );
}

/** Paper-theme footer navigation: plain links, no boxes. */
export function PaperNav({ prev, next, prevLabel, nextLabel }: {
  prev?: PostMeta; next?: PostMeta; prevLabel: string; nextLabel: string;
}) {
  return (
    <nav aria-label="More articles" className="mt-12 hidden flex-wrap justify-between gap-3 border-t border-border pt-3.5 text-[17px] paper:flex">
      {prev ? <Link href={postHref(prev)} className="text-brand-text">← {prevLabel}: {prev.title}</Link> : <span />}
      {next && <Link href={postHref(next)} className="text-brand-text">{nextLabel}: {next.title} →</Link>}
    </nav>
  );
}
