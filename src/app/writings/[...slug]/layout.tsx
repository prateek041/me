import type { Metadata } from "next";
import readDirectoryRecursively from "../api/blog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

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
      className={`container mt-10`}
    >
      <SidebarProvider>
        <AppSidebar isMobile={false} node={blogStructure} />
        <div className="w-full">
          {children}
        </div>
      </SidebarProvider>
    </div>
  );
}
