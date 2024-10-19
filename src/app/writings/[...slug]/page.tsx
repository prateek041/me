import readDirectoryRecursively, { FileSystemNode } from "../api/blog";

import { promises as fs } from "fs";
import { remark } from "remark";
import matter from "gray-matter";
import html from "remark-html";
import ArticleContent from "@/app/components/ArticleContent";
import Image from "next/image";

const LifeArticle = async ({ params }: { params: { slug: string[] } }) => {
  const pathName = process.cwd() + "/writings";
  console.log("PATHNAME", pathName);
  console.log("FILE PATH", `${pathName}/${params.slug.join("/")}.md`);
  const file = await fs.readFile(
    `${pathName}/${params.slug.join("/")}.md`,
    "utf8",
  );
  const imageBuffer = await fs.readFile(
    `${pathName}/${params.slug.join("/")}.jpg`,
  );
  const imageBase64 = imageBuffer.toString("base64");
  const imageSrc = `data:image/jpeg;base64,${imageBase64}`;
  const matterResult = matter(file);
  const processedMarkdown = await remark()
    .use(html)
    .process(matterResult.content);

  const contentHtml = processedMarkdown.toString();
  return (
    <div className="w-full md:mx-10 ">
      <div className="flex flex-col items-center gap-y-10">
        <h1 className="md:text-8xl text-4xl">{matterResult.data.title}</h1>
        <h3>{matterResult.data.date}</h3>
      </div>
      <div className="md:sticky top-16 flex justify-center w-full mt-10">
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
      <div className="w-full bg-[#352F44] relative md:p-[3rem] md:-mt-[calc(40%-300px)]">
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
