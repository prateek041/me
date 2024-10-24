"use client";

import React from "react";
import { FileSystemNode } from "../writings/api/blog";
import { MdArrowDropDown, MdArrowRight } from "react-icons/md";
import { TbPointFilled } from "react-icons/tb";
import path from "path";
import { usePathname, useRouter } from "next/navigation";

const FileExplorer = ({
  nodes,
  isMobile,
}: {
  nodes: FileSystemNode[];
  path: string;
  isMobile: boolean;
}) => {
  const articles = nodes[0]?.children;
  const articlesSortedByTime = articles?.sort((a, b) => {
    return (
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );
  });
  return (
    <div className={`${isMobile ? "w-full" : "border-r"} border-black h-full`}>
      <ul>
        {articlesSortedByTime?.map((node) => (
          <FileNode key={node.id} node={node} />
        ))}
      </ul>
    </div>
  );
};

const fileName = (name: string) => {
  const file = name.split(".")[0];
  return file.split("-").join(" ");
};

const filePath = (name: string, articlePath: string) => {
  const checkPath = articlePath.split("/");
  const relativePath = checkPath.splice(1, 2).join("/");
  const finalpath = path.relative(relativePath, name.split(".")[0]);
  return finalpath;
};

const FileNode = ({ node }: { node: FileSystemNode }) => {
  const path = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);
  const isFile = node.name.endsWith(".md");
  const router = useRouter();

  return (
    <div>
      <li>
        <div onClick={toggleOpen} style={{ cursor: "pointer" }}>
          {node.isDirectory ? (
            isOpen ? (
              <Directory
                name={node.name}
                date={node.lastModified}
                isOpen={isOpen}
              />
            ) : (
              <Directory
                name={node.name}
                date={node.lastModified}
                isOpen={isOpen}
              />
            )
          ) : isFile ? (
            <a
              onClick={() => {
                const rerouteTo = filePath(node.articlePath, path);
                router.push(rerouteTo);
              }}
            >
              <div className="flex items-center">
                <TbPointFilled />
                <span className="flex flex-col w-full gap-x-2">
                  <div>
                    {fileName(node.name)}
                    <p className="text-xs font-light">{node.lastModified}</p>
                  </div>
                </span>
              </div>
            </a>
          ) : (
            ""
          )}
        </div>
        {isOpen && node.children && (
          <ul className="pl-5">
            {node.children.map((child) => (
              <FileNode key={child.id} node={child} />
            ))}
          </ul>
        )}
      </li>
    </div>
  );
};

const Directory = ({
  name,
  date,
  isOpen,
}: {
  name: string;
  date: string;
  isOpen: boolean;
}) => {
  return (
    <div className="md:my-4 my-2 flex items-center">
      {isOpen ? <MdArrowDropDown /> : <MdArrowRight />}
      <div className="w-full">
        <h3 className="font-semibold text-lg">{fileName(name)}</h3>
        <p className="text-xs">{date}</p>
      </div>
    </div>
  );
};

export default FileExplorer;
