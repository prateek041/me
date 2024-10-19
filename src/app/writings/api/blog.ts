"use server";

import * as fs from "fs";
import matter from "gray-matter";
import * as path from "path";
import html from "remark-html";
import { remark } from "remark";

export interface Blog {
  id: string;
  title: string;
  articlePath: string;
  imageUrl: string;
  parentPath: string | null;
}

export interface FileSystemNode {
  id: string; // Unique id for React rendering
  name: string;
  path: string;
  parentPath: string | null;
  isDirectory: boolean;
  children?: FileSystemNode[];
}

const readDirectoryRecursively = (
  dirPath: string,
  parentPath: string | null = null,
): FileSystemNode[] => {
  const files = fs.readdirSync(dirPath);

  return files.map((file): FileSystemNode => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    const isDirectory = stat.isDirectory();

    const node: FileSystemNode = {
      id: fullPath,
      name: file,
      path: fullPath,
      parentPath: parentPath,
      isDirectory: isDirectory,
      children: isDirectory
        ? readDirectoryRecursively(fullPath, fullPath)
        : undefined,
    };

    return node;
  });
};

export async function getArticle(path: string) {
  const data = fs.readFileSync(path, "utf8");

  const matterResult = matter(data);

  const articleHTML = (
    await remark().use(html).process(matterResult.content)
  ).toString();
  return articleHTML;
}

export default readDirectoryRecursively;
