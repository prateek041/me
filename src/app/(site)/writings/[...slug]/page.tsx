import Script from "next/script";
import { redirect } from "next/navigation";

import type { Metadata, ResolvingMetadata } from "next";

import type { FileSystemNode } from "../api/blog";
import { getLatestArticleUnderPath, getLatestArticleSlugPerSection, getNodeBySlug } from "../api/tree";
import {
  getAdjacentPosts,
  getAllPosts,
  getHeaderImage,
  getPost,
  getPostMeta,
  getPostNumbers,
  getSeriesPosts,
  getTree,
  prettify,
  SITE_URL,
  type PostMeta,
} from "@/lib/writings";
import ArticleLayout from "@/components/writings/ArticleLayout";
import BookLayout from "@/components/writings/BookLayout";
import { bookHref, getBook, getBooks, getChapterContext } from "@/lib/books";
import PersonalLayout from "@/components/writings/PersonalLayout";
import type { Crumb } from "@/components/writings/parts";


interface LifeArticleProps {
  params: { slug: string[] };
}

export async function generateMetadata(
  { params }: LifeArticleProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const book = getBook(params.slug);
  if (book) {
    const url = `${SITE_URL}${bookHref(book)}`;
    const description = book.description || `${book.title}, a book by Prateek Singh.`;
    return {
      title: book.title,
      description,
      authors: [{ name: "Prateek Singh", url: SITE_URL }],
      alternates: { canonical: url },
      openGraph: { type: "book", title: book.title, description, url, siteName: "Prateek Singh", images: book.cover ? [{ url: SITE_URL + book.cover }] : undefined },
      twitter: { card: book.cover ? "summary_large_image" : "summary", title: book.title, description, site: "@prateek_0041", creator: "@prateek_0041" },
    };
  }
  const meta = getPostMetaOrRedirect(params.slug);

  const title = meta.title;
  const description =
    meta.description || "An interesting article from Prateek Singh's Blog.";
  const pageUrl = `${SITE_URL}/writings/${params.slug.join("/")}`;
  const relativeImagePathFromPublic = `/${params.slug.join("/")}.jpg`;
  const absoluteOgImageUrl = `${SITE_URL}${relativeImagePathFromPublic}`;

  // Extract category from first slug segment
  const articleSection = params.slug[0] || "General";

  const tags = meta.tags;

  return {
    title: title,
    description: description,
    keywords: meta.keywords ?? [
      "blog",
      "articles",
      "tech",
      "writings",
      "Prateek Singh",
      title,
    ],
    authors: [{ name: "Prateek Singh", url: SITE_URL }],
    creator: "Prateek Singh",
    publisher: "Prateek Singh",
    robots: {
      index: !meta.draft,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "article",
      title: title,
      description: description,
      url: pageUrl,
      siteName: "Prateek Singh's Blog",
      locale: "en_US",
      alternateLocale: ["en_US"],
      images: [
        {
          url: absoluteOgImageUrl,
          width: 1200,
          height: 675,
          alt: title,
          type: "image/jpeg",
        },
      ],
      publishedTime: meta.date,
      modifiedTime: meta.modifiedDate ?? meta.date,
      authors: ["Prateek Singh"],
      section: articleSection,
      tags: tags.length > 0 ? tags : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [
        {
          url: absoluteOgImageUrl,
          width: 1200,
          height: 675,
          alt: title,
        },
      ],
      site: "@prateek_0041",
      creator: "@prateek_0041",
    },
  };
}

const SlugPage = async ({ params }: LifeArticleProps) => {
  // A book's folder (e.g. /writings/life/my-book) is the book's own page.
  const book = getBook(params.slug);
  if (book) {
    return (
      <>
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Book",
              name: book.title,
              description: book.description || undefined,
              url: `${SITE_URL}${bookHref(book)}`,
              author: { "@type": "Person", name: "Prateek Singh", url: SITE_URL },
              hasPart: book.chapters.map((c, i) => ({ "@type": "Chapter", position: i + 1, name: c.title, url: `${SITE_URL}/writings/${c.slug.join("/")}` })),
            }),
          }}
        />
        <BookLayout book={book} />
      </>
    );
  }

  const rootNodes = getTree();
  getPostMetaOrRedirect(params.slug, rootNodes);
  const post = await getPost(params.slug);
  if (!post) redirect("/writings");
  const { meta, Content } = post;
  const chapter = getChapterContext(meta);

  const imageForSeo = `${SITE_URL}/${params.slug.join("/")}.jpg`;
  const pageUrl = `${SITE_URL}/writings/${params.slug.join("/")}`;

  // writings / tech / ebpf ... : the section links to its list, folders link to their newest article.
  const crumbs: Crumb[] = params.slug.slice(0, -1).map((seg, i) => {
    const latest = i === 0 ? null : getLatestArticleUnderPath(rootNodes, params.slug.slice(0, i + 1));
    if (i === 1 && chapter) return { label: chapter.book.title.toLowerCase(), href: bookHref(chapter.book) };
    return {
      label: prettify(seg).toLowerCase(),
      href: i === 0 ? `/writings?section=${seg}` : latest ? `/writings/${latest.join("/")}` : null,
    };
  });

  const jsonLd = (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
          headline: meta.title,
          description: meta.description,
          image: imageForSeo,
          author: { "@type": "Person", name: "Prateek Singh", url: SITE_URL },
          publisher: {
            "@type": "Organization",
            name: "Prateek Singh's Blog",
            logo: { "@type": "ImageObject", url: `${SITE_URL}/minimal.png` },
          },
          datePublished: meta.date,
          dateModified: meta.modifiedDate ?? meta.date,
        }),
      }}
    />
  );

  if (meta.section === "tech" && chapter) {
    return (
      <>
        {jsonLd}
        <ArticleLayout
          meta={meta}
          Content={Content}
          crumbs={crumbs}
          series={{ title: chapter.book.title, posts: chapter.book.chapters, kind: "book", href: bookHref(chapter.book) }}
          prev={chapter.prev}
          next={chapter.next}
        />
      </>
    );
  }

  if (meta.section === "tech") {
    const seriesPosts = getSeriesPosts(meta);
    const list = seriesPosts ?? [...getAllPosts().filter((p) => p.section === meta.section)].sort((a, b) => (a.date < b.date ? -1 : 1));
    const i = list.findIndex((p) => p.slug.join("/") === meta.slug.join("/"));
    return (
      <>
        {jsonLd}
        <ArticleLayout
          meta={meta}
          Content={Content}
          crumbs={crumbs}
          series={seriesPosts ? { title: prettify(meta.slug[1]), posts: seriesPosts } : null}
          prev={i > 0 ? list[i - 1] : undefined}
          next={i >= 0 && i < list.length - 1 ? list[i + 1] : undefined}
        />
      </>
    );
  }

  const { newer, older } = getAdjacentPosts(meta);
  const numbers = getPostNumbers();
  const more = getAllPosts()
    .filter((p) => p.section === meta.section && p.slug.join("/") !== meta.slug.join("/"))
    .map((p) => ({ meta: p, image: getHeaderImage(p), number: numbers.get(p.slug.join("/")) ?? 0 }))
    .sort((a, b) => Number(!!b.image) - Number(!!a.image))
    .slice(0, 2);

  return (
    <>
      {jsonLd}
      <PersonalLayout
        meta={meta}
        Content={Content}
        crumbs={crumbs}
        image={getHeaderImage(meta)}
        prev={chapter ? chapter.prev : older}
        next={chapter ? chapter.next : newer}
        more={chapter ? [] : more}
        book={chapter ? { title: chapter.book.title, href: bookHref(chapter.book), index: chapter.index, total: chapter.book.chapters.length } : undefined}
      />
    </>
  );
};

/**
 * Metadata for an article slug. A section or folder slug (e.g. /writings/tech)
 * redirects to the newest article under it.
 */
function getPostMetaOrRedirect(slug: string[], rootNodes: FileSystemNode[] = getTree()): PostMeta {
  const node = getNodeBySlug(rootNodes, slug);
  const meta = node && !node.isDirectory ? getPostMeta(slug) : null;
  if (meta) return meta;
  const redirectSlug =
    getLatestArticleUnderPath(rootNodes, slug) ??
    (slug.length > 0 ? getLatestArticleUnderPath(rootNodes, slug.slice(0, 1)) : null) ??
    (() => {
      const sectionMap = getLatestArticleSlugPerSection(rootNodes);
      return sectionMap.tech ?? sectionMap.thoughts ?? sectionMap.life ?? null;
    })();
  if (redirectSlug?.length) redirect(`/writings/${redirectSlug.join("/")}`);
  redirect("/writings");
}

// Only real articles are pre-rendered; folder slugs are handled by the redirect above.
export async function generateStaticParams() {
  return [...getAllPosts().map((p) => ({ slug: p.slug })), ...getBooks().map((b) => ({ slug: b.slug }))];
}

export default SlugPage;
