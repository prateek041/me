import React from "react";
import { promises as fs } from "fs";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import emoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import Script from "next/script";
import { redirect } from "next/navigation";

import type { Metadata, ResolvingMetadata } from "next";

import readDirectoryRecursively, { FileSystemNode } from "../api/blog";
import { getLatestArticleUnderPath, getLatestArticleSlugPerSection, getNodeBySlug } from "../api/tree";
import AudioPlayer from "@/components/AudioPlayer";
import ArticleContent from "@/components/ArticleContent";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbEllipsis,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

const SITE_URL = "https://prateeksingh.xyz";

interface LifeArticleProps {
  params: { slug: string[] };
}

async function getArticleData(slug: string[]) {
  const pathName = process.cwd() + "/writings";
  const articleMarkdownPath = `${pathName}/${slug.join("/")}.md`;
  const fileContent = await fs.readFile(articleMarkdownPath, "utf8");
  const { data: frontmatter, content } = matter(fileContent);
  return { frontmatter, content, articleMarkdownPath };
}

export async function generateMetadata(
  { params }: LifeArticleProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const rootNodes = readDirectoryRecursively(process.cwd() + "/writings");
  const node = getNodeBySlug(rootNodes, params.slug);
  const isArticle = node && !node.isDirectory && node.name.endsWith(".md");
  if (!isArticle) {
    const redirectSlug =
      getLatestArticleUnderPath(rootNodes, params.slug) ??
      (params.slug.length > 0
        ? getLatestArticleUnderPath(rootNodes, params.slug.slice(0, 1))
        : null) ??
      (() => {
        const sectionMap = getLatestArticleSlugPerSection(rootNodes);
        return sectionMap.tech ?? sectionMap.thoughts ?? sectionMap.life ?? null;
      })();
    if (redirectSlug?.length) redirect(`/writings/${redirectSlug.join("/")}`);
    redirect("/writings");
  }

  const { frontmatter } = await getArticleData(params.slug);

  const title = frontmatter.title || "Untitled Article";
  const description =
    frontmatter.description ||
    "An interesting article from Prateek Singh's Blog.";
  const pageUrl = `${SITE_URL}/writings/${params.slug.join("/")}`;
  const relativeImagePathFromPublic = `/${params.slug.join("/")}.jpg`;
  const absoluteOgImageUrl = `${SITE_URL}${relativeImagePathFromPublic}`;

  // Extract category from first slug segment
  const articleSection = params.slug[0] || "General";

  // Extract tags from frontmatter (support both array and string formats)
  const tags = frontmatter.tags
    ? Array.isArray(frontmatter.tags)
      ? frontmatter.tags
      : [frontmatter.tags]
    : [];

  return {
    title: title,
    description: description,
    keywords: frontmatter.keywords || [
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
      index: true,
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
      publishedTime: frontmatter.date
        ? new Date(frontmatter.date).toISOString()
        : undefined,
      modifiedTime: frontmatter.modifiedDate
        ? new Date(frontmatter.modifiedDate).toISOString()
        : frontmatter.date
          ? new Date(frontmatter.date).toISOString()
          : undefined,
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

const LifeArticle = async ({ params }: LifeArticleProps) => {
  const rootNodes = readDirectoryRecursively(process.cwd() + "/writings");
  const node = getNodeBySlug(rootNodes, params.slug);

  // If slug is section-only, a directory, or invalid path, redirect to the latest article in that section/path.
  const isArticle = node && !node.isDirectory && node.name.endsWith(".md");
  if (!isArticle) {
    const redirectSlug =
      getLatestArticleUnderPath(rootNodes, params.slug) ??
      (params.slug.length > 0
        ? getLatestArticleUnderPath(rootNodes, params.slug.slice(0, 1))
        : null) ??
      (() => {
        const sectionMap = getLatestArticleSlugPerSection(rootNodes);
        return sectionMap.tech ?? sectionMap.thoughts ?? sectionMap.life ?? null;
      })();
    if (redirectSlug && redirectSlug.length > 0) {
      redirect(`/writings/${redirectSlug.join("/")}`);
    }
    redirect("/writings");
  }

  const { frontmatter, content } = await getArticleData(params.slug);
  const isTech = params.slug.includes("tech");

  const imagePathForNextImageComponent = `/${params.slug.join("/")}.jpg`;
  const absoluteImagePathForJsonLd = `${SITE_URL}${imagePathForNextImageComponent}`;
  const pageUrl = `${SITE_URL}/writings/${params.slug.join("/")}`;

  const segmentHrefs: (string[] | null)[] = [];
  for (let i = 0; i < params.slug.length - 1; i++) {
    segmentHrefs.push(getLatestArticleUnderPath(rootNodes, params.slug.slice(0, i + 1)));
  }
  const parentHref =
    params.slug.length > 1
      ? getLatestArticleUnderPath(rootNodes, params.slug.slice(0, -1))
      : null;

  const processedMarkdown = await remark()
    .use(emoji)
    .use(remarkGfm)
    .use(html)
    .process(content);
  const contentHtml = processedMarkdown.toString();

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
            headline: frontmatter.title,
            description: frontmatter.description,
            image: absoluteImagePathForJsonLd,
            author: { "@type": "Person", name: "Prateek Singh", url: SITE_URL },
            publisher: {
              "@type": "Organization",
              name: "Prateek Singh's Blog",
              logo: { "@type": "ImageObject", url: `${SITE_URL}/minimal.png` },
            },
            datePublished: frontmatter.date
              ? getDate(frontmatter.date)
              : undefined,
            dateModified: frontmatter.modifiedDate
              ? getDate(frontmatter.modifiedDate)
              : frontmatter.date
                ? getDate(frontmatter.date)
                : undefined,
          }),
        }}
      />
      <div className="container mx-auto relative w-full md:px-10 gap-y-2 space-y-8 md:my-5 my-10 scroll-smooth">
        <div className="w-full flex flex-col">
          <div className="flex items-center">
            <SidebarTrigger />
            <BreadCrumb
              articlePath={params.slug}
              segmentHrefs={segmentHrefs}
              parentHref={parentHref}
            />
          </div>
        </div>

        {frontmatter.date && (
          <p className="text-muted-foreground text-center text-sm mt-1">
            Published on:{" "}
            {new Date(frontmatter.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}

        <div className="flex relative flex-col mt-4  md:gap-y-10 gap-y-2">
          <h1 className="xl:text-8xl lg:text-7xl text-4xl text-center font-bold">
            {frontmatter.title}
          </h1>
          <div className="flex items-center gap-3">
            <Image
              src="/prateek-singh.jpg"
              alt="Prateek Singh"
              width={32}
              height={32}
              className="rounded-full object-cover ring-2 ring-border/50"
            />
            <div className="flex flex-col items-start">
              <span className="font-medium text-xs text-foreground">Prateek Singh</span>
            </div>
          </div>

          {!isTech && frontmatter.audio && (
            <div className="mt-4">
              <AudioPlayer audioFile={frontmatter.audio} />
            </div>
          )}
        </div>
        {!isTech && (
          <div className="md:sticky top-10 flex justify-center w-full mt-10 mb-8 md:mb-0">
            <div className="relative w-full" style={{ maxWidth: "800px" }}>
              <Image
                className="object-cover rounded-lg shadow-lg"
                src={imagePathForNextImageComponent}
                alt={frontmatter.title || "Article Header Image"}
                width={1200}
                height={675}
                style={{ width: "100%", height: "auto" }}
                quality={85}
                priority
              />
            </div>
          </div>
        )}
        <div
          className={
            isTech
              ? "flex w-full max-w-screen-2xl relative"
              : "flex w-full max-w-screen-2xl relative md:-mt-[calc(80%-300px)] lg:p-[3rem] lg:-mt-[calc(60%-300px)] xl:p-[3rem] xl:-mt-[calc(40%-300px)]"
          }
        >
          <ArticleContent pageContent={contentHtml} />
        </div>
      </div>
    </>
  );
};

const BreadCrumb = ({
  articlePath,
  segmentHrefs,
  parentHref,
}: {
  articlePath: string[];
  segmentHrefs: (string[] | null)[];
  parentHref: string[] | null;
}) => {
  const currentPathSegments = articlePath.slice(0, -1);
  const currentPageLabel = articlePath[articlePath.length - 1].replace(/-/g, " ");
  const parentLink =
    parentHref != null ? `/writings/${parentHref.join("/")}` : "/writings";

  const fullTrail = (
    <BreadcrumbList className="hidden md:flex">
      <BreadcrumbItem>
        <BreadcrumbLink href="/writings" className="text-xs capitalize">
          Writings
        </BreadcrumbLink>
      </BreadcrumbItem>
      {currentPathSegments.map((segment, index) => {
        const href = segmentHrefs[index];
        const link = href != null ? `/writings/${href.join("/")}` : "#";
        return (
          <React.Fragment key={segment + index}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={link}
                className="text-xs capitalize"
              >
                {segment.replace(/-/g, " ")}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </React.Fragment>
        );
      })}
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage className="text-xs capitalize">
          {currentPageLabel}
        </BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  );

  const collapsedTrail = (
    <BreadcrumbList className="flex md:hidden">
      <BreadcrumbItem>
        <BreadcrumbLink href="/writings" className="text-xs capitalize">
          Writings
        </BreadcrumbLink>
      </BreadcrumbItem>
      {articlePath.length > 1 && (
        <>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href={parentLink}
              className="text-xs capitalize"
              aria-label="Go to parent section"
            >
              <BreadcrumbEllipsis className="h-6 w-6 [&>svg]:h-3.5 [&>svg]:w-3.5" />
            </BreadcrumbLink>
          </BreadcrumbItem>
        </>
      )}
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage className="text-xs capitalize truncate max-w-[180px] sm:max-w-[240px]">
          {currentPageLabel}
        </BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  );

  return (
    <Breadcrumb aria-label="Breadcrumb">
      {collapsedTrail}
      {fullTrail}
    </Breadcrumb>
  );
};

export async function generateStaticParams() {
  const writingsBaseDir = process.cwd() + "/writings"; // Base directory for writings
  const allNodes = readDirectoryRecursively(writingsBaseDir); // Get all nodes

  const paramsList: { slug: string[] }[] = [];
  const queue: FileSystemNode[] = [...allNodes]; // Process nodes from the queue

  while (queue.length > 0) {
    const node = queue.shift();
    if (node) {
      // We are only interested in files that are Markdown files for generating page slugs
      if (
        node.isDirectory === false &&
        typeof node.path === "string" && // Ensure node.path is a string
        node.path.startsWith(writingsBaseDir) && // Ensure it's an absolute path within our writings dir
        node.path.endsWith(".md")
      ) {
        // 1. Make path relative to writingsBaseDir
        // e.g., /home/user/proj/writings/tech/article.md -> /tech/article.md
        let relativePath = node.path.substring(writingsBaseDir.length);

        // Remove leading slash if present after substring, making it tech/article.md
        if (relativePath.startsWith("/")) {
          relativePath = relativePath.substring(1);
        }

        // 2. Remove .md extension
        // e.g., tech/article.md -> tech/article
        const slugPath = relativePath.replace(/\.md$/, "");

        // 3. Split into segments and push if slugPath is not empty
        // e.g., tech/article -> ['tech', 'article']
        if (slugPath) {
          paramsList.push({ slug: slugPath.split("/") });
        }
      } else if (node.isDirectory && node.children) {
        // If it's a directory, add its children to the queue to process them
        queue.push(...node.children);
      }
    }
  }
  return paramsList;
}

const getDate = (dateString: string): string | undefined => {
  if (!dateString) return undefined;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string provided to getDate:", dateString);
      return undefined;
    }
    return date.toISOString();
  } catch (error) {
    console.error("Error parsing date string in getDate:", dateString, error);
    return undefined;
  }
};

export default LifeArticle;
