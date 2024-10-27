import readDirectoryRecursively, { FileSystemNode } from "../api/blog";
import { promises as fs } from "fs";
import { remark } from "remark";
import matter from "gray-matter";
import html from "remark-html";
import ArticleContent from "@/app/components/ArticleContent";
import Image from "next/image";
import emoji from "remark-emoji";
import AudioPlayer from "@/app/components/AudioPlayer";

const LifeArticle = async ({ params }: { params: { slug: string[] } }) => {
  const pathName = process.cwd() + "/writings";
  const file = await fs.readFile(
    `${pathName}/${params.slug.join("/")}.md`,
    "utf8",
  );
  const isTech = params.slug.includes("tech");

  const imageBuffer = await fs.readFile(
    `${pathName}/${params.slug.join("/")}.jpg`,
  );
  const imageBase64 = imageBuffer.toString("base64");
  const imageSrc = `data:image/jpeg;base64,${imageBase64}`;
  const matterResult = matter(file);
  const processedMarkdown = await remark()
    .use(emoji)
    .use(html)
    .process(matterResult.content);

  const contentHtml = processedMarkdown.toString();
  return (
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
            src={imageSrc}
            alt="Article Header image"
            style={{ width: "100%", height: "auto" }}
            width={1000}
            height={1000}
            quality={100}
          />
        </div>
      </div>
      <div className="flex w-full max-w-screen-2xl bg-gray-100 relative md:-mt-[calc(80%-300px)] lg:p-[3rem] lg:-mt-[calc(60%-300px)] xl:p-[3rem] xl:-mt-[calc(40%-300px)]">
        <ArticleContent pageContent={contentHtml} />
      </div>
    </div>
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

export default LifeArticle;
