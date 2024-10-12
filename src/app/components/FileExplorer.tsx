"use client";

import React from "react";
import { FileSystemNode } from "../writings/api/blog";
import Link from "next/link";
import { IoMdArrowDropright } from "react-icons/io";
import { MdArrowDropDown } from "react-icons/md";
import { TbPointFilled } from "react-icons/tb";

const FileExplorer = ({ nodes }: { nodes: FileSystemNode[]; path: string }) => {
  const articles = nodes[0].children;
  return (
    <div className="border-r border-[#FAF0E6] h-full">
      <ul>{articles?.map((node) => <FileNode key={node.id} node={node} />)}</ul>
    </div>
  );
};

const FileNode = ({ node }: { node: FileSystemNode }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);
  const isFile = node.name.endsWith(".md");
  const fileName = (name: string) => {
    const file = name.slice(0, -3).split("-").join(" ");
    return file;
  };

  return (
    <Link href={`${"hello"}`}>
      <li>
        <div onClick={toggleOpen} style={{ cursor: "pointer" }}>
          {node.isDirectory ? (
            isOpen ? (
              <MdArrowDropDown />
            ) : (
              <IoMdArrowDropright />
            )
          ) : isFile ? (
            <span className="flex items-center gap-x-2">
              <TbPointFilled /> {fileName(node.name)}
            </span>
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
    </Link>
  );
};

export default FileExplorer;
