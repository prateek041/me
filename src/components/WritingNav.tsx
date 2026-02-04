"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import FileExplorer from "./FileExplorer";
import { FileSystemNode } from "@/app/writings/api/blog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarRail } from "./ui/sidebar";

const SECTION_ORDER = ["tech", "thoughts", "life"] as const;
const SECTION_TITLE: Record<string, string> = {
  tech: "Tech",
  thoughts: "Thoughts",
  life: "Life",
};

const AppSidebar = ({
  nodes,
  sectionLatestMap,
}: {
  nodes: FileSystemNode[];
  sectionLatestMap: Record<string, string[]>;
}) => {
  const pathName = usePathname();
  const router = useRouter();
  const route = pathName.split("/");
  const currentSection = route[2] ?? "";

  const Navlinks = useMemo(() => {
    return SECTION_ORDER.filter((key) => sectionLatestMap[key]).map((key) => ({
      url: `/writings/${sectionLatestMap[key].join("/")}`,
      title: SECTION_TITLE[key] ?? key,
      key,
    }));
  }, [sectionLatestMap]);

  const [path, setPath] = useState(nodes[0]?.name ?? currentSection);
  const isActive = Navlinks.findIndex((item) => item.key === currentSection);
  const activeIndex = isActive >= 0 ? isActive : 0;

  useEffect(() => {
    if (currentSection && SECTION_ORDER.includes(currentSection as "tech" | "thoughts" | "life")) {
      setPath(currentSection);
    }
  }, [currentSection]);

  const blogType = nodes.filter((item) => item.name === path) || [];

  const handleArticleTypeChange = (value: string) => {
    const item = Navlinks.find((n) => n.title === value);
    if (item) router.push(item.url);
  }

  return (
    <Sidebar className="mt-10" variant={"floating"}>
      <SidebarHeader>
        <Select onValueChange={handleArticleTypeChange}>
          <SelectTrigger className="w-full text-start">
            <SelectValue placeholder={Navlinks[activeIndex]?.title ?? "Writings"} />
          </SelectTrigger>
          <SelectContent >
            {Navlinks.map((value, index) => {
              return (
                <SelectItem key={value.key} value={value.title}>
                  <NavItem
                    isActive={activeIndex === index}
                    title={value.title}
                  />
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <FileExplorer isMobile={false} path={path} nodes={blogType} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
};

const NavItem = ({
  isActive,
  title,
}: {
  isActive: boolean;
  title: string;
}) => {
  return (
    <div
      className={isActive ? "underline font-semibold" : ""}
    >
      {title}
    </div>
  );
};

export default AppSidebar;
