import type { Metadata } from "next";
import WritingNav from "../../components/WritingNav";
import readDirectoryRecursively from "../api/blog";

export const metadata: Metadata = {
  title: "Writings",
  description: "All that I have written",
};

interface WritingLayoutParams {
  children: React.ReactNode;
  params: {
    slug: string;
  };
}

export default async function WritingLayout({
  children,
  params,
}: WritingLayoutParams) {
  let blogStructure = readDirectoryRecursively(process.cwd() + "/writings");
  blogStructure = blogStructure.filter((node) => node.name === params.slug[0]);

  return (
    <div
      className={`bg-[#352F44] text-[#FAF0E6] md:h-screen w-full container flex mx-auto md:grid md:grid-cols-5 mt-5`}
    >
      <div className="hidden md:grid md:col-span-1">
        <WritingNav nodes={blogStructure} />
      </div>
      <div className="overflow-y-auto md:col-span-4 md:mx-10 flex justify-center">
        {children}
      </div>
    </div>
  );
}
