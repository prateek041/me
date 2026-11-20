import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readerComponents } from "@/components/reader/components";
import { bookHref, getBook, getBooks, getChapterContext, statusLabel } from "@/lib/books";
import { formatDate, getAllPosts, getHeaderImage, getPost, getPostMeta, instapaperHref, postHref, prettify, READER_URL, SITE_URL } from "@/lib/writings";

type Props = { params: { slug: string[] } };

export const dynamicParams = false;

export function generateStaticParams() {
  return [...getAllPosts().filter((p) => !p.draft).map((p) => ({ slug: p.slug })), ...getBooks().map((b) => ({ slug: b.slug }))];
}

/*
 * Instapaper (and other read-later parsers) take the title, author, date, lead
 * image and summary from these tags, and the text from the single <article>.
 */
export function generateMetadata({ params }: Props): Metadata {
  const book = getBook(params.slug);
  if (book) return { title: book.title, description: book.description || undefined };
  const meta = getPostMeta(params.slug);
  if (!meta) return {};
  const image = getHeaderImage(meta);
  const url = READER_URL + postHref(meta);
  return {
    title: meta.title,
    description: meta.description || undefined,
    authors: [{ name: "Prateek Singh", url: SITE_URL }],
    openGraph: {
      type: "article",
      title: meta.title,
      description: meta.description || undefined,
      url,
      siteName: "Prateek Singh",
      publishedTime: meta.date,
      modifiedTime: meta.modifiedDate ?? meta.date,
      authors: ["Prateek Singh"],
      images: image ? [{ url: SITE_URL + image }] : undefined,
    },
  };
}

/** A book's contents page: its chapters in reading order. */
function ReaderBook({ book }: { book: NonNullable<ReturnType<typeof getBook>> }) {
  return (
    <>
      <p className="top">
        <a href="/">All writings</a> · {book.section} · book
      </p>
      <h1>{book.title}</h1>
      <p className="meta">By Prateek Singh · {statusLabel(book)}</p>
      {book.description && <p>{book.description}</p>}
      <h2>Contents</h2>
      <ol>
        {book.chapters.map((c) => (
          <li key={c.slug.join("/")}>
            <a href={postHref(c)}>{c.title}</a> <small>({c.readMinutes} min)</small>
          </li>
        ))}
      </ol>
      <hr />
      <p className="meta">
        Also at <a href={SITE_URL + bookHref(book)}>{SITE_URL.replace("https://", "") + bookHref(book)}</a>.
      </p>
    </>
  );
}

export default async function ReaderArticle({ params }: Props) {
  const book = getBook(params.slug);
  if (book) return <ReaderBook book={book} />;
  const post = await getPost(params.slug);
  if (!post || post.meta.draft) notFound();
  const { meta, Content } = post;
  const image = getHeaderImage(meta);
  const chapter = getChapterContext(meta);
  const kicker = chapter
    ? `${meta.section} · ${chapter.book.title}, chapter ${chapter.index + 1} of ${chapter.book.chapters.length}`
    : [meta.section, meta.slug.length > 2 ? prettify(meta.slug[1]) : null].filter(Boolean).join(" · ");

  return (
    <>
      <p className="top">
        <a href="/">All writings</a>
        {kicker && <> · {kicker}</>}
      </p>
      <article>
        <header>
          <h1>{meta.title}</h1>
          <p className="meta byline">
            By <a rel="author" href={SITE_URL}>Prateek Singh</a> · <time dateTime={meta.date}>{formatDate(meta.date)}</time> ·{" "}
            {meta.readMinutes} min read
          </p>
        </header>
        {image && (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" />
          </figure>
        )}
        <Content components={readerComponents} />
      </article>
      <hr />
      {chapter && (
        <p className="meta">
          {chapter.prev && <>Previous: <a href={postHref(chapter.prev)}>{chapter.prev.title}</a>. </>}
          {chapter.next && <>Next: <a href={postHref(chapter.next)}>{chapter.next.title}</a>. </>}
          <a href={bookHref(chapter.book)}>Contents</a>.
        </p>
      )}
      <p className="meta">
        Originally published at <a href={SITE_URL + postHref(meta)}>{SITE_URL.replace("https://", "") + postHref(meta)}</a>.{" "}
        <a href={instapaperHref(READER_URL + postHref(meta))}>Save to Instapaper</a>.
      </p>
    </>
  );
}
