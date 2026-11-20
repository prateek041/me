import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readerComponents } from "@/components/reader/components";
import { formatDate, getAllPosts, getHeaderImage, getPost, getPostMeta, instapaperHref, postHref, prettify, READER_URL, SITE_URL } from "@/lib/writings";

type Props = { params: { slug: string[] } };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().filter((p) => !p.draft).map((p) => ({ slug: p.slug }));
}

/*
 * Instapaper (and other read-later parsers) take the title, author, date, lead
 * image and summary from these tags, and the text from the single <article>.
 */
export function generateMetadata({ params }: Props): Metadata {
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

export default async function ReaderArticle({ params }: Props) {
  const post = await getPost(params.slug);
  if (!post || post.meta.draft) notFound();
  const { meta, Content } = post;
  const image = getHeaderImage(meta);
  const kicker = [meta.section, meta.slug.length > 2 ? prettify(meta.slug[1]) : null].filter(Boolean).join(" · ");

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
      <p className="meta">
        Originally published at <a href={SITE_URL + postHref(meta)}>{SITE_URL.replace("https://", "") + postHref(meta)}</a>.{" "}
        <a href={instapaperHref(READER_URL + postHref(meta))}>Save to Instapaper</a>.
      </p>
    </>
  );
}
