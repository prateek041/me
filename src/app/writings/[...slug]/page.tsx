import readDirectoryRecursively, { FileSystemNode } from "../api/blog";
import { promises as fs } from "fs";
import { remark } from "remark";
import matter from "gray-matter";
import html from "remark-html";
import ArticleContent from "@/app/components/ArticleContent";
import Image from "next/image";
import emoji from "remark-emoji";
import AudioPlayer from "@/app/components/AudioPlayer";
import Head from "next/head";
import remarkGfm from "remark-gfm";
import Impression from "@/app/components/Impressions";
import Script from "next/script";

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

  // TODO: get likes, comments and number of shares here and pass down to impressions.

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
      <div className="container w-full md:mx-10 md:my-5 my-10 scroll-smooth">
        <div className="flex flex-col items-center md:gap-y-10 gap-y-2">
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
          <div className="relative md:-left-8">
            <Image
              className="object-cover"
              src={imagePath}
              alt="Article Header image"
              style={{ width: "100vw", height: "100%" }}
              width={1000}
              height={1000}
              quality={100}
            />
          </div>
        </div>
        <div className="flex w-full max-w-screen-2xl bg-gray-100 relative md:-mt-[calc(80%-300px)] lg:p-[3rem] lg:-mt-[calc(60%-300px)] xl:p-[3rem] xl:-mt-[calc(40%-300px)]">
          <ArticleContent pageContent={contentHtml} />
        </div>

        <div className="md:hidden flex -translate-y-10 xl:p-5 lg:p-2 rounded-t-xl w-2/3 md:absolute relative justify-center mx-auto bottom-0 bg-[#E9E3E2]">
          <Impression articleName={params.slug} />
        </div>
      </div>
      <div className="md:flex hidden xl:p-5 lg:p-2 rounded-t-xl w-1/2 md:absolute relative justify-center mx-auto bottom-0 bg-[#E9E3E2]">
        <Impression articleName={params.slug} />
      </div>
    </>
  );
};

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
