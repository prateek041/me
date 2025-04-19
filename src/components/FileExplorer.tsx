"use client";

import React from "react";
import Link from "next/link";
import { FileSystemNode } from "@/app/writings/api/blog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "@radix-ui/react-dropdown-menu";

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
    <div className={`${isMobile ? "w-full" : ""} border-black h-full`}>
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
  const isFile = node.name.endsWith(".md");
  const [isOpen, setIsOpen] = React.useState<boolean>(false)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="space-y-2"
    >
      {node.isDirectory ? (
        <div>
          <div className="flex items-center justify-between my-2 space-x-4">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full">
                <div className="flex w-full items-center justify-between">
                  <h3 className="text-lg max-w-44 overflow-auto font-semibold">
                    {node.name}
                  </h3>
                  <ChevronsUpDown className="h-4 w-4" />
                </div>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            {node.children && node.children.map((child) => (
              <FileNode key={child.id} node={child} />
            ))}
          </CollapsibleContent>
        </div>
      ) : isFile ? (
        <div className="w-full">
          <Link className="mx-2" href={`/${filePath(node.articlePath)}`}>
            <Button className="w-full" variant={"ghost"}>
              <div className="flex flex-col items-start w-full text-sm shadow-sm">
                <h3 className="text-base">
                  {fileName(node.name)}
                </h3>
                <p className="text-xs font-light">{node.lastModified}</p>
              </div>
            </Button>
          </Link>
          <Separator className="my-2" />
        </div>
      ) : (
        ""
      )}
    </Collapsible>
  );
};

export default FileExplorer;
