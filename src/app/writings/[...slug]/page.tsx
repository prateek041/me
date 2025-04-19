import readDirectoryRecursively, { FileSystemNode } from "../api/blog";
import { promises as fs } from "fs";
import { remark } from "remark";
import matter from "gray-matter";
import html from "remark-html";
import Image from "next/image";
import emoji from "remark-emoji";
import Head from "next/head";
import remarkGfm from "remark-gfm";
import Script from "next/script";
import AudioPlayer from "@/components/AudioPlayer";
import ArticleContent from "@/components/ArticleContent";
import Impression from "@/components/Impressions";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { param } from "framer-motion/client";
import { Separator } from "@/components/ui/separator";

const LifeArticle = async ({ params }: { params: { slug: string[] } }) => {
  const pathName = process.cwd() + "/writings";
  const articlePath = `${pathName}/${params.slug.join("/")}.md`;
  const file = await fs.readFile(articlePath, "utf8");
  const isTech = params.slug.includes("tech");

  const imagePath = `/${params.slug.join("/")}.jpg`;
  const matterResult = matter(file);
  const processedMarkdown = await remark()
    .use(emoji)
    .use(remarkGfm)
    .use(html)
    .process(matterResult.content);

  const contentHtml = processedMarkdown.toString();
  return (
    <>
      <Head>
        <title>{matterResult.data.title}</title>
        <meta name="description" content={matterResult.data.description} />
        <meta name="keywords" content="blog, articles, tech, writings" />
        <meta name="robots" content="index, follow" />
        <link
          rel="canonical"
          href={`https://prateeksingh.tech/writings/${params.slug.join("/")}`}
        />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={matterResult.data.title} />
        <meta
          property="og:description"
          content={matterResult.data.description}
        />
        <meta
          property="og:url"
          content={`https://prateeksingh.tech/writings/${params.slug.join(
            "/"
          )}`}
        />
        <meta property="og:image" content={imagePath} />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={matterResult.data.title} />
        <meta
          name="twitter:description"
          content={matterResult.data.description}
        />
        <meta name="twitter:image" content={imagePath} />
        <meta name="twitter:site" content="@prateek_0041" />
        <meta name="twitter:creator" content="@prateek_0041" />

        {matterResult.data.date && (
          <meta
            property="article:published_time"
            content={matterResult.data.date}
          />
        )}
      </Head>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: matterResult.data.title,
            datePublished: getDate(matterResult.data.date) || "",
            author: "Prateek Singh",
            description: matterResult.data.description,
          }),
        }}
      />
      <div className="container relative w-full md:px-10 md:my-5 my-10 scroll-smooth">
        <div className="w-fit flex flex-col">
          <div className="flex items-center">
            <SidebarTrigger />
            <BreadCrumb articlePath={params.slug} />
          </div>
          <Separator className="mb-5" />

        </div>
        <div className="flex relative flex-col items-center md:gap-y-10 gap-y-2">
          <h1 className="xl:text-8xl lg:text-7xl text-4xl text-center">
            {matterResult.data.title}
          </h1>
          <h3>{matterResult.data.date}</h3>
          {!isTech && (
            <div className="">
              <AudioPlayer audioFile={matterResult.data.audio} />
            </div>
          )}
        </div>
        <div className="md:sticky top-10 flex justify-center w-full mt-10">
          <div className="relative">
            <Image
              className="object-cover"
              src={imagePath}
              alt="Article Header image"
              style={{ width: "80vw", height: "100%" }}
              width={1000}
              height={1000}
              quality={100}
            />
          </div>
        </div>
        <div className="flex w-full  max-w-screen-2xl relative md:-mt-[calc(80%-300px)] lg:p-[3rem] lg:-mt-[calc(60%-300px)] xl:p-[3rem] xl:-mt-[calc(40%-300px)]">
          <ArticleContent pageContent={contentHtml} />
        </div>

        {/* <div className="flex -translate-y-10 xl:p-5 lg:p-2 rounded-t-xl w-2/3 md:absolute relative justify-center mx-auto bottom-0"> */}
        {/*   <Impression articleName={params.slug} /> */}
        {/* </div> */}
      </div>
      {/* <div className="md:flex hidden xl:p-5 lg:p-2 rounded-t-xl w-1/2 md:absolute relative justify-center mx-auto bottom-0"> */}
      {/*   <Impression articleName={params.slug} /> */}
      {/* </div> */}
    </>
  );
};

const BreadCrumb = ({ articlePath }: { articlePath: string[] }) => {
  const prevPath = articlePath.slice(0, articlePath.length - 1)
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {prevPath.map((value, index) => {
          return (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink className="text-xs" >{value}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )
        })}
        <BreadcrumbItem>
          <BreadcrumbPage className="text-xs">{articlePath[articlePath.length - 1]}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export async function generateStaticParams() {
  const articlePaths = process.cwd() + "/writings";
  const posts = readDirectoryRecursively(articlePaths);
  getArticlePaths(posts);

  return posts.map((post) => {
    return {
      slug: post.path,
    };
  });
}

// TODO: Understand this implementation
const getArticlePaths = (blog: FileSystemNode[]) => {
  const articles: string[] = [];
  const queue: FileSystemNode[] = blog;
  while (queue.length > 0) {
    const node = queue.shift();
    if (node?.isDirectory === false) {
      articles.push(node.path);
    } else {
      queue.push(...(node?.children || []));
    }
  }
};

const getDate = (dateString: string) => {
  const date = new Date(dateString)
  const isoDate = date.toISOString()
  return isoDate
}

export default LifeArticle;
