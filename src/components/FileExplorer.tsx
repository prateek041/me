"use client";

import React from "react";
import Link from "next/link";
import { FileSystemNode } from "@/app/writings/api/blog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronDownIcon, ChevronRight, ChevronsUpDown, File } from "lucide-react";
import { Button } from "./ui/button";
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "./ui/sidebar";
import { Separator } from "./ui/separator";

/** Sort nodes by publication date (newest first). Items without a date go last. */
function sortNodesByDate(nodes: FileSystemNode[]): FileSystemNode[] {
  return [...nodes].sort((a, b) => {
    const timeA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
    const timeB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
    return timeB - timeA;
  });
}

const FileExplorer = ({
  nodes,
  isMobile,
}: {
  nodes: FileSystemNode[];
  path: string;
  isMobile: boolean;
}) => {
  const children = nodes[0]?.children ?? [];
  const sorted = sortNodesByDate(children);
  return (
    <div className={`${isMobile ? "w-full" : ""} border-black h-full`}>
      <ul>
        {sorted.map((node) => (
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
    <SidebarMenuItem>
      <Collapsible
        open={isOpen}
        key={node.id}
        onOpenChange={setIsOpen}
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
      >
        {node.isDirectory ? (
          <>
            <CollapsibleTrigger
              className="w-full"
            >
              <SidebarMenuButton className="w-full">
                <ChevronRight className="transition-transform" />
                <h3 className="">
                  {node.name}
                </h3>
              </SidebarMenuButton>
            </ CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {node.children &&
                  sortNodesByDate(node.children).map((child) => (
                    <FileNode key={child.id} node={child} />
                  ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </>
        ) : isFile ? (
          <SidebarMenuButton
            className="data-[active=true]:bg-transparent h-fit overflow-auto"
          >
            <Link href={`/${filePath(node.articlePath)}`}>
              <div className="flex items-center gap-x-2">
                <div className="flex flex-col justify-center">
                  <p className="">
                    {fileName(node.name)}
                  </p>
                  <p className="text-xs font-light">{node.dateDisplay ?? (node.lastModified ? new Date(node.lastModified).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "")}</p>
                </div>
              </div>
            </Link>
          </SidebarMenuButton>
        ) : (
          ""
        )}
      </Collapsible>
    </SidebarMenuItem>
  );
};

export default FileExplorer;
