"use client";

import React from "react";
import { FileSystemNode } from "../writings/api/blog";
import { MdArrowDropDown, MdArrowRight } from "react-icons/md";
import { TbPointFilled } from "react-icons/tb";
import Link from "next/link";

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

const filePath = (articlePath: string) => {
  return articlePath.split(".")[0]
};

const FileNode = ({ node }: { node: FileSystemNode }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);
  const isFile = node.name.endsWith(".md");

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
            <Link href={`/${filePath(node.articlePath)}`}>
              <div className="flex items-center gap-x-2 border border-b-black py-1 mx-5">
                <TbPointFilled />
                <div className="flex flex-col w-full gap-y-0 gap-x-2">
                  <h3 className="lg:text-sm md:text-xs text-base">
                    {fileName(node.name)}
                  </h3>
                  <p className="text-xs font-light">{node.lastModified}</p>
                </div>
              </div>
            </Link>
          ) : (
            ""
          )}
        </div>
        {isOpen && node.children && (
          <ul className="lg:pl-2 pl-1 md:text-base leading-tight text-sm">
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
    <div className="flex items-center">
      {isOpen ? <MdArrowDropDown /> : <MdArrowRight />}
      <div className="w-full">
        <h3 className="font-semibold xl:text-lg md:text-sm text-lg">{fileName(name)}</h3>
        <p className="lg:text-base text-xs">{date}</p>
      </div>
    </div>
  );
};

export default FileExplorer;
