import type { Metadata } from "next";
import WritingNav from "../../components/WritingNav";
import readDirectoryRecursively from "../api/blog";
import MobileNav from "@/app/components/MobileNav";

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
      className={`md:h-screen w-full flex mx-auto md:grid md:grid-cols-5 mt-5`}
    >
      <div className="hidden mt-10 md:grid md:col-span-1">
        <WritingNav isMobile={false} nodes={blogStructure} />
      </div>
      <div className="md:hidden z-10 absolute w-full h-full inset-x-0">
        <MobileNav nodes={blogStructure} />
      </div>
      <div className="overflow-y-auto mt-10 md:col-span-4 md:mx-10 flex justify-center">
        {children}
      </div>
    </div>
  );
}
