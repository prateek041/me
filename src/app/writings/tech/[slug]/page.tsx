import { getArticle, getArticleNameAndLocation } from "@/utils/fetchPosts";
import { join } from "path";
import { IoIosArrowRoundBack } from "react-icons/io";
import Link from "next/link";
import readDirectoryRecursively from "../../api/blog";

export async function generateStaticParams() {
  const directoryTree = readDirectoryRecursively(
    process.cwd() + "/writings/tech",
  );
  console.log(directoryTree);

  // Object.entries(series).map(([key, value]) => {
  //   value.map((entry) => {
  //     articles.push(entry.name);
  //   });
  // });
  //
  return directoryTree.map((item) => ({
    slug: item.name,
  }));
}

export default async function Page({ params }) {
  console.log("I was called ", params);
  // const articleName = params.posts;

  // const series = getArticleNameAndLocation(postsDirectory);

  // let article = "";
  // await Promise.all(
  //   Object.entries(series).map(async ([key, value]) => {
  //     await Promise.all(
  //       value.map(async (entry) => {
  //         if (entry.name == articleName) {
  //           article = await getArticle(entry.path);
  //         }
  //       }),
  //     );
  //   }),
  // );
  //
  // const articleHTML = article.articleHTML
  //   ? article.articleHTML
  //   : "Article not found";
  //
  return (
    <div className={`flex flex-col gap-y-5`}>
      <Link href="/writings" className="no-underline">
        <div className="flex items-center gap-x-1">
          <IoIosArrowRoundBack />
          <p className="text-sm font-light">Back</p>
        </div>
      </Link>
      <div>THis is new {params} </div>
      {/* <div */}
      {/*   className={`flex flex-col gap-y-4 font-light leading-relaxed tracking-wide max-h-[75vh] md:max-h-[70vh] overflow-y-auto`} */}
      {/*   dangerouslySetInnerHTML={{ __html: articleHTML }} */}
      {/* /> */}
    </div>
  );
}
