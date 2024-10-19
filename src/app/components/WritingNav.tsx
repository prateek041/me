"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import FileExplorer from "./FileExplorer";
import { FileSystemNode } from "../writings/api/blog";

const Navlinks = [
  {
    url: "/writings/tech",
    title: "Tech",
  },
  {
    url: "/writings/thoughts",
    title: "Thoughts",
  },
  {
    url: "/writings/life",
    title: "Life",
  },
];
const WritingNav = ({ nodes }: { nodes: FileSystemNode[] }) => {
  const pathName = usePathname();
  const route = pathName.split("/");
  const [path, setPath] = useState(nodes[0].name);
  const [isActive, setIsActive] = useState(2);

  useEffect(() => {
    Navlinks.map((item, index) => {
      if (item.title.toLowerCase() === route[route.length - 1]) {
        setIsActive(index);
        setPath(item.title.toLowerCase());
      }
    });
  }, [route]);

  const blogType = nodes.filter((item) => item.name === path) || [];

  return (
    <div className="h-full">
      <div className="flex justify-center gap-x-5 ">
        {Navlinks.map((item, index) => {
          return (
            <NavItem
              key={index}
              url={item.url}
              index={index}
              isActive={isActive}
              title={item.title}
            />
          );
        })}
      </div>
      <FileExplorer path={path} nodes={blogType} />
    </div>
  );
};

const NavItem = ({
  index,
  isActive,
  url,
  title,
}: {
  index: number;
  isActive: number;
  url: string;
  title: string;
}) => {
  return (
    <Link
      className={isActive === index ? "underline font-semibold" : ""}
      href={url}
    >
      {title}
    </Link>
  );
};

export default WritingNav;
