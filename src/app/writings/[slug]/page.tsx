import readDirectoryRecursively, { FileSystemNode } from "../api/blog";

import { promises as fs } from "fs";
import { remark } from "remark";
import matter from "gray-matter";
import html from "remark-html";
import ArticleContent from "@/app/components/ArticleContent";
import Image from "next/image";

const LifeArticle = async ({ params }: { params: { slug: string } }) => {
  // const articleType = params.slug;
  //
  // if (articleType === "life"){
  //   const articlePath =
  // const path = process.cwd() + "/writings/life/journey-so-far.md"
  // }

  const pathName = process.cwd() + "/writings/life";
  const file = await fs.readFile(`${pathName}/journey-so-far.md`, "utf8");
  const imageBuffer = await fs.readFile(`${pathName}/journey-so-far.jpg`);
  const imageBase64 = imageBuffer.toString("base64");
  const imageSrc = `data:image/jpeg;base64,${imageBase64}`;
  const matterResult = matter(file);
  const processedMarkdown = await remark()
    .use(html)
    .process(matterResult.content);

  const contentHtml = processedMarkdown.toString();
  return (
    <div className="w-full mx-10 ">
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
  console.log("This is posts", posts);

  return posts.map((post) => {
    return {
      slug: post.path,
    };
  });
}

const getPathRecursively = (
  fileSystemNode: FileSystemNode,
  allPaths: string[] = []
) => {
  if (!fileSystemNode.isDirectory) {
    return [fileSystemNode.path];
  }
  const paths: string[] = getPathRecursively(
    fileSystemNode?.children as FileSystemNode
  );
  return [...allPaths, ...paths];
};

export default LifeArticle;
