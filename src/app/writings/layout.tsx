import type { Metadata } from "next";
import WritingNav from "../components/WritingNav";
import readDirectoryRecursively from "./api/blog";

export const metadata: Metadata = {
  title: "Writings",
  description: "All that I have written",
};

export default async function WritingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    slug: string;
  };
}) {
  // Example usage:
  const blogStructure = readDirectoryRecursively(process.cwd() + "/writings");
  return (
    <div
      className={`bg-[#352F44] text-[#FAF0E6] md:h-screen w-full container mx-auto grid grid-cols-5 mt-5`}
    >
      <div className="col-span-1">
        <WritingNav nodes={blogStructure} />
      </div>
      <div className="overflow-y-auto col-span-4 mx-10 flex justify-center">
        {children}
      </div>
    </div>
  );
}
