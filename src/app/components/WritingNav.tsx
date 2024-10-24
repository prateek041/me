"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import FileExplorer from "./FileExplorer";
import { FileSystemNode } from "../writings/api/blog";

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
const WritingNav = ({
  nodes,
  isMobile,
}: {
  nodes: FileSystemNode[];
  isMobile: boolean;
}) => {
  const pathName = usePathname();
  const route = pathName.split("/");
  const [path, setPath] = useState(nodes[0].name);
  const [isActive, setIsActive] = useState(2);

  useEffect(() => {
    Navlinks.map((item, index) => {
      if (item.title.toLowerCase() === route[2]) {
        setIsActive(index);
        setPath(item.title.toLowerCase());
      }
    });
  }, [route]);

  const blogType = nodes.filter((item) => item.name === path) || [];

  return (
    <div className="h-full py-10">
      {isMobile ? (
        <div className="absolute px-5 flex flex-col items-start inset-x-0 justify-start mb-10">
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
          <FileExplorer isMobile={true} path={path} nodes={blogType} />
        </div>
      ) : (
        <div className="h-full">
          <div className="flex justify-start gap-x-5">
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
          <FileExplorer isMobile={false} path={path} nodes={blogType} />
        </div>
      )}
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
