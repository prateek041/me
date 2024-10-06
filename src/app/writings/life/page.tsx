import { promises as fs } from "fs";
import { remark } from "remark";
import matter from "gray-matter";
import html from "remark-html";
import ArticleContent from "@/app/components/ArticleContent";
import Image from "next/image";

const LifeArticle = async () => {
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
  console.log(contentHtml);
  return (
    <div className="w-full mx-10 ">
      <div className="flex flex-col items-center gap-y-10">
        <h1 className="text-8xl">{matterResult.data.title}</h1>
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
      <div className="bg-[#352F44] relative md:p-[5rem] md:-mt-[calc(40%-300px)]">
        <ArticleContent pageContent={contentHtml} />
      </div>
    </div>
  );
};

export default LifeArticle;
