"use client";

import React from "react";
import { FileSystemNode } from "../writings/api/blog";
import Link from "next/link";
import { IoMdArrowDropright } from "react-icons/io";
import { MdArrowDropDown } from "react-icons/md";
import { TbPointFilled } from "react-icons/tb";
import path from "path";

const FileExplorer = ({ nodes }: { nodes: FileSystemNode[]; path: string }) => {
  const articles = nodes[0]?.children;
  return (
    <div className="border-r border-[#FAF0E6] h-full">
      <ul>
        {articles?.map((node) => (
          <FileNode key={node.id} node={node} />
        ))}
      </ul>
    </div>
  );
};

const FileNode = ({ node }: { node: FileSystemNode }) => {
  console.log("this is node", node);
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);
  const isFile = node.name.endsWith(".md");
  const fileName = (name: string) => {
    const file = name.slice(0, -3).split("-").join(" ");
    return file;
  };

  return (
    <div>
      <li>
        <div onClick={toggleOpen} style={{ cursor: "pointer" }}>
          {node.isDirectory ? (
            isOpen ? (
              <div className="flex items-center">
                <MdArrowDropDown />
                {node.name}
              </div>
            ) : (
              <div className="flex items-center">
                <IoMdArrowDropright />
                {node.name}
              </div>
            )
          ) : isFile ? (
            <Link
              href={`/writing/thoughts/${fileName(
                path.relative(node.parentPath as string, node.path)
              )}`}
            >
              <span className="flex items-center gap-x-2">
                <TbPointFilled /> {fileName(node.name)}{" "}
              </span>
            </Link>
          ) : (
            ""
          )}
        </div>
        {isOpen && node.children && (
          <ul>
            {node.children.map((child) => (
              <FileNode key={child.id} node={child} />
            ))}
          </ul>
        )}
      </li>
    </div>
  );
};

export default FileExplorer;
