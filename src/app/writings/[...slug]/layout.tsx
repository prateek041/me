import type { Metadata } from "next";
import readDirectoryRecursively from "../api/blog";
import { getLatestArticleSlugPerSection } from "../api/tree";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/WritingNav";

export const metadata: Metadata = {
  title: "Writings",
  description: "All that I have written",
};

interface WritingLayoutParams {
  children: React.ReactNode;
  params: {
    slug: string[];
  };
}

export default function WritingLayout({
  children,
  params,
}: WritingLayoutParams) {
  const fullTree = readDirectoryRecursively(process.cwd() + "/writings");
  const sectionLatestMap = getLatestArticleSlugPerSection(fullTree);
  const currentSection = params.slug[0];
  const blogStructure = currentSection
    ? fullTree.filter((node) => node.name === currentSection)
    : fullTree;

  return (
    <div
      className={`mt-10 w-full container mx-auto`}
    >
      <SidebarProvider>
        <AppSidebar nodes={blogStructure} sectionLatestMap={sectionLatestMap} />
        <SidebarInset>
          <div className="container mx-auto md:w-full">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
