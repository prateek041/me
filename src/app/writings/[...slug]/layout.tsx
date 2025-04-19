import type { Metadata } from "next";
import readDirectoryRecursively from "../api/blog";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/WritingNav";

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

export default function WritingLayout({
  children,
  params,
}: WritingLayoutParams) {
  let blogStructure = readDirectoryRecursively(process.cwd() + "/writings");
  blogStructure = blogStructure.filter((node) => node.name === params.slug[0]);

  return (
    <div
      className={`mt-10 w-full container mx-auto`}
    >
      <SidebarProvider>
        <AppSidebar nodes={blogStructure} />
        <SidebarInset>
          <div className="mx-auto">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
