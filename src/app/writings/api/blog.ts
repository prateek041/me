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
  articlePath: string;
  id: string; // Unique id for React rendering
  name: string;
  path: string;
  parentPath: string | null;
  lastModified: string; // ISO string, used for sorting
  /** Human-readable date exactly as in the article frontmatter (files only). */
  dateDisplay?: string;
  isDirectory: boolean;
  children?: FileSystemNode[];
}

/** Read frontmatter date from a .md file. Returns sortable ISO and display string (as written). */
function getFrontmatterDate(
  filePath: string,
): { sortable: string; display: string } | undefined {
  const fileData = fs.readFileSync(filePath, "utf8");
  const matterResult = matter(fileData);
  const d = matterResult.data.date;
  if (d == null) return undefined;
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return undefined;
  const sortable = date.toISOString();
  const display = typeof d === "string" ? d : date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return { sortable, display };
}

/** Latest lastModified among direct children (for sorting directories). */
function getLatestChildDate(children: FileSystemNode[]): string {
  const dates = children
    .map((c) => c.lastModified)
    .filter((s): s is string => Boolean(s));
  if (dates.length === 0) return "";
  return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
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
    const children = isDirectory
      ? readDirectoryRecursively(fullPath, fullPath)
      : undefined;

    let lastModified: string;
    let dateDisplay: string | undefined;
    if (isDirectory) {
      lastModified = children && children.length > 0 ? getLatestChildDate(children) : "";
    } else {
      const parsed = getFrontmatterDate(fullPath);
      if (parsed) {
        lastModified = parsed.sortable;
        dateDisplay = parsed.display;
      } else {
        lastModified = stat.mtime.toISOString();
        dateDisplay = stat.mtime.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      }
    }

    const node: FileSystemNode = {
      articlePath: path.relative(process.cwd(), fullPath),
      id: fullPath,
      name: file,
      path: fullPath,
      parentPath: parentPath,
      isDirectory,
      lastModified,
      dateDisplay,
      children,
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
