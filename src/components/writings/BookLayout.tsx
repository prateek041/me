import Image from "next/image";
import Link from "next/link";
import { statusLabel, type Book } from "@/lib/books";
import { postHref } from "@/lib/writings";

/**
 * A book's landing page, laid out like a title page and a table of contents:
 * cover, title, description, status and the published chapters in order.
 * No author chips, dates or reading times.
 */
export default function BookLayout({ book }: { book: Book }) {
  const first = book.chapters[0];

  return (
    <>
      {/* ---------- dark and light ---------- */}
      <main className="mx-auto w-full max-w-3xl px-5 pb-24 sm:px-8 paper:hidden">
        <section className="flex flex-col items-center gap-6 pb-14 pt-12 text-center md:pb-20 md:pt-20">
          {book.cover && (
            <Image src={book.cover} alt="" width={480} height={640} priority sizes="240px" className="mb-4 aspect-[3/4] w-[200px] border border-border object-cover md:w-[240px]" />
          )}
          <div className="font-read text-[16px] tracking-[0.14em] text-subtle [font-variant:small-caps]">a book</div>
          <h1 className="max-w-[16ch] font-read text-5xl font-semibold leading-[1.02] tracking-[-0.02em] sm:text-6xl lg:text-[72px]">{book.title}</h1>
          {book.description && <p className="max-w-[46ch] font-read text-lg italic leading-normal text-muted-foreground md:text-[21px]">{book.description}</p>}
          <div className="font-read text-[15px] italic text-subtle">{statusLabel(book)}</div>
          <Link href={postHref(first)} className="mt-2 inline-flex min-h-12 items-center gap-2.5 bg-brand px-6 text-[15px] font-semibold text-brand-foreground hover:opacity-90">
            Start reading <span aria-hidden="true">→</span>
          </Link>
        </section>

        <section aria-labelledby="contents" className="border-t border-border pt-12">
          <h2 id="contents" className="mb-6 text-center font-read text-[16px] tracking-[0.14em] text-subtle [font-variant:small-caps]">contents</h2>
          <ol className="flex flex-col">
            {book.chapters.map((c, i) => (
              <li key={c.slug.join("/")}>
                <Link href={postHref(c)} className="group flex gap-5 border-b border-border py-5 hover:text-brand-text">
                  <span className="w-8 flex-none pt-1 text-right font-read text-lg italic text-subtle">{i + 1}</span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="font-read text-2xl font-semibold leading-tight md:text-[26px]">{c.title}</span>
                    {c.description && <span className="font-read text-[17px] text-muted-foreground">{c.description}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </main>

      {/* ---------- paper ---------- */}
      <main className="mx-auto hidden w-full max-w-3xl px-5 pb-24 pt-10 paper:block sm:px-8 md:pt-16">
        <div className="flex flex-col items-center gap-2 text-center">
          {book.cover && (
            <Image src={book.cover} alt="" width={480} height={640} sizes="200px" className="mb-6 aspect-[3/4] w-[180px] object-cover" />
          )}
          <div className="text-base tracking-[0.06em] text-subtle [font-variant:small-caps]">a book</div>
          <h1 className="text-[34px] font-semibold leading-[1.15] sm:text-[44px]">{book.title}</h1>
          <div className="text-base italic text-subtle">{statusLabel(book)}</div>
        </div>
        {book.description && (
          <p className="mx-auto mt-8 max-w-[560px] text-center text-[17px] italic leading-[1.55]">{book.description}</p>
        )}
        <nav aria-labelledby="p-contents" className="mt-10 border-y border-border border-t-foreground py-3.5 text-[17px]">
          <div id="p-contents" className="mb-1.5 font-bold">Contents</div>
          <ol className="grid list-none gap-1">
            {book.chapters.map((c, i) => (
              <li key={c.slug.join("/")}>
                <Link href={postHref(c)} className="text-brand-text">
                  {i + 1}&nbsp;&nbsp;{c.title}
                </Link>
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
