"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FileExplorer from "./FileExplorer";
import { FileSystemNode } from "@/app/writings/api/blog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sidebar, SidebarContent, SidebarHeader } from "./ui/sidebar";

const Navlinks = [
  {
    url: "/writings/tech/home",
    title: "Tech",
  },
  {
    url: `/writings/thoughts/home`,
    title: "Thoughts",
  },
  {
    url: "/writings/life/journey-so-far",
    title: "Life",
  },
];
const AppSidebar = ({
  nodes,
}: {
  nodes: FileSystemNode[];
}) => {
  const pathName = usePathname();
  const route = pathName.split("/");
  const [path, setPath] = useState(nodes[0].name);
  const [isActive, setIsActive] = useState(2);
  const router = useRouter()

  useEffect(() => {
    Navlinks.map((item, index) => {
      if (item.title.toLowerCase() === route[2]) {
        setIsActive(index);
        setPath(item.title.toLowerCase());
      }
    });
  }, [route]);

  const blogType = nodes.filter((item) => item.name === path) || [];

  const handleArticleTypeChange = (value: string) => {
    const newActiveIndex = Navlinks.findIndex((item) => item.title === value)
    setIsActive(newActiveIndex)
    router.push(Navlinks[newActiveIndex].url)
  }

  return (
    <Sidebar className="mt-10">
      <SidebarHeader>
        <Select onValueChange={handleArticleTypeChange}>
          <SelectTrigger className="w-full text-start">
            <SelectValue placeholder={Navlinks[isActive].title} />
          </SelectTrigger>
          <SelectContent onSelect={() => { console.log("what now") }} >
            {Navlinks.map((value, index) => {
              return (
                <SelectItem key={index} value={value.title}>
                  <NavItem
                    key={index}
                    url={value.url}
                    index={index}
                    isActive={isActive}
                    title={value.title}
                  />
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </SidebarHeader>
      <SidebarContent>
        <div className="h-full">
          <FileExplorer isMobile={false} path={path} nodes={blogType} />
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

const NavItem = ({
  index,
  isActive,
  title,
}: {
  index: number;
  isActive: number;
  url: string;
  title: string;
}) => {
  return (
    <div
      className={isActive === index ? "underline font-semibold" : ""}
    >
      {title}
    </div>
  );
};

export default AppSidebar;
