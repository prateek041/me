import React from "react";
import { promises as fs } from "fs";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import emoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import Script from "next/script";

import type { Metadata, ResolvingMetadata } from 'next';

import readDirectoryRecursively, { FileSystemNode } from "../api/blog";
import AudioPlayer from "@/components/AudioPlayer";
import ArticleContent from "@/components/ArticleContent";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

const SITE_URL = "https://prateeksingh.tech";

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
  const { frontmatter } = await getArticleData(params.slug);

  const title = frontmatter.title || "Untitled Article";
  const description = frontmatter.description || "An interesting article from Prateek Singh's Blog.";
  const pageUrl = `${SITE_URL}/writings/${params.slug.join("/")}`;
  const relativeImagePathFromPublic = `/${params.slug.join("/")}.jpg`;
  const absoluteOgImageUrl = `${SITE_URL}${relativeImagePathFromPublic}`;

  return {
    title: title,
    description: description,
    keywords: frontmatter.keywords || ["blog", "articles", "tech", "writings", "Prateek Singh", title],
    authors: [{ name: "Prateek Singh", url: SITE_URL }],
    creator: "Prateek Singh",
    publisher: "Prateek Singh",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
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
      images: [{ url: absoluteOgImageUrl, alt: title }],
      publishedTime: frontmatter.date ? new Date(frontmatter.date).toISOString() : undefined,
      modifiedTime: frontmatter.modifiedDate
        ? new Date(frontmatter.modifiedDate).toISOString()
        : (frontmatter.date ? new Date(frontmatter.date).toISOString() : undefined),
      authors: ["Prateek Singh"],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [absoluteOgImageUrl],
      site: "@prateek_0041",
      creator: "@prateek_0041",
    },
  };
}

const LifeArticle = async ({ params }: LifeArticleProps) => {
  const { frontmatter, content } = await getArticleData(params.slug);
  const isTech = params.slug.includes("tech");

  const imagePathForNextImageComponent = `/${params.slug.join("/")}.jpg`;
  const absoluteImagePathForJsonLd = `${SITE_URL}${imagePathForNextImageComponent}`;
  const pageUrl = `${SITE_URL}/writings/${params.slug.join("/")}`;

  const processedMarkdown = await remark().use(emoji).use(remarkGfm).use(html).process(content);
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
            "mainEntityOfPage": { "@type": "WebPage", "@id": pageUrl },
            "headline": frontmatter.title,
            "description": frontmatter.description,
            "image": absoluteImagePathForJsonLd,
            "author": { "@type": "Person", "name": "Prateek Singh", "url": SITE_URL },
            "publisher": {
              "@type": "Organization",
              "name": "Prateek Singh's Blog",
              "logo": { "@type": "ImageObject", "url": `${SITE_URL}/minimal.png` },
            },
            "datePublished": frontmatter.date ? getDate(frontmatter.date) : undefined,
            "dateModified": frontmatter.modifiedDate
              ? getDate(frontmatter.modifiedDate)
              : (frontmatter.date ? getDate(frontmatter.date) : undefined),
          }),
        }}
      />
      <div className="container mx-auto relative w-full md:px-10 md:my-5 my-10 scroll-smooth">
        <div className="w-full flex flex-col">
          <div className="flex items-center">
            <SidebarTrigger />
            <BreadCrumb articlePath={params.slug} />
          </div>
          <Separator className="mb-5" />
        </div>
        <div className="flex relative flex-col items-center md:gap-y-10 gap-y-2">
          <h1 className="xl:text-8xl lg:text-7xl text-4xl text-center font-bold">{frontmatter.title}</h1>
          {frontmatter.date && (
            <p className="text-muted-foreground text-sm">
              Published on: {new Date(frontmatter.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
          {!isTech && frontmatter.audio && (
            <div className="mt-4"><AudioPlayer audioFile={frontmatter.audio} /></div>
          )}
        </div>
        <div className="md:sticky top-10 flex justify-center w-full mt-10 mb-8 md:mb-0">
          <div className="relative w-full" style={{ maxWidth: "800px" }}>
            <Image
              className="object-cover rounded-lg shadow-lg"
              src={imagePathForNextImageComponent}
              alt={frontmatter.title || "Article Header Image"}
              width={1200} height={675}
              style={{ width: "100%", height: "auto" }}
              quality={85} priority
            />
          </div>
        </div>
        <div className="flex w-full max-w-screen-2xl relative md:-mt-[calc(80%-300px)] lg:p-[3rem] lg:-mt-[calc(60%-300px)] xl:p-[3rem] xl:-mt-[calc(40%-300px)]">
          <ArticleContent pageContent={contentHtml} />
        </div>
      </div>
    </>
  );
};

const BreadCrumb = ({ articlePath }: { articlePath: string[] }) => {
  const currentPathSegments = articlePath.slice(0, -1);
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink href="/writings" className="text-xs capitalize">Writings</BreadcrumbLink></BreadcrumbItem>
        {currentPathSegments.map((segment, index) => (
          <React.Fragment key={segment + index}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/writings/${articlePath.slice(0, index + 1).join('/')}`} className="text-xs capitalize">
                {segment.replace(/-/g, ' ')}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </React.Fragment>
        ))}
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbPage className="text-xs capitalize">{articlePath[articlePath.length - 1].replace(/-/g, ' ')}</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList>
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
        typeof node.path === 'string' &&         // Ensure node.path is a string
        node.path.startsWith(writingsBaseDir) && // Ensure it's an absolute path within our writings dir
        node.path.endsWith('.md')                // CRITICAL: Only process .md files
      ) {
        // 1. Make path relative to writingsBaseDir
        // e.g., /home/user/proj/writings/tech/article.md -> /tech/article.md
        let relativePath = node.path.substring(writingsBaseDir.length);

        // Remove leading slash if present after substring, making it tech/article.md
        if (relativePath.startsWith('/')) {
          relativePath = relativePath.substring(1);
        }

        // 2. Remove .md extension
        // e.g., tech/article.md -> tech/article
        const slugPath = relativePath.replace(/\.md$/, '');

        // 3. Split into segments and push if slugPath is not empty
        // e.g., tech/article -> ['tech', 'article']
        if (slugPath) {
          paramsList.push({ slug: slugPath.split('/') });
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
