import * as fs from "fs";
import matter from "gray-matter";
import * as path from "path";

export interface FileSystemNode {
  articlePath: string;
  id: string; // Unique id for React rendering
  name: string;
  path: string;
  parentPath: string | null;
  lastModified: string;
  dateDisplay?: string;
  isDirectory: boolean;
  children?: FileSystemNode[];
}

/** A post is a .md or .mdx file. Files starting with "_" or "." are never published. */
export const isPostFile = (name: string) => /\.mdx?$/.test(name) && !/^[_.]/.test(name);

/** Drafts (`draft: true`) are listed in `next dev` only. */
const SHOW_DRAFTS = process.env.NODE_ENV !== "production";

function readFrontmatter(filePath: string) {
  return matter(fs.readFileSync(filePath, "utf8")).data as Record<string, unknown>;
}

function getFrontmatterDate(
  data: Record<string, unknown>,
): { sortable: string; display: string } | undefined {
  const d = data.date;
  if (d == null) return undefined;
  const date = d instanceof Date ? d : new Date(String(d));
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
  const nodes: FileSystemNode[] = [];

  for (const file of fs.readdirSync(dirPath)) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    const isDirectory = stat.isDirectory();

    let children: FileSystemNode[] | undefined;
    let lastModified: string;
    let dateDisplay: string | undefined;

    if (isDirectory) {
      children = readDirectoryRecursively(fullPath, fullPath);
      lastModified = children.length > 0 ? getLatestChildDate(children) : "";
    } else if (isPostFile(file)) {
      const data = readFrontmatter(fullPath);
      if (data.draft === true && !SHOW_DRAFTS) continue;
      const parsed = getFrontmatterDate(data);
      if (parsed) {
        lastModified = parsed.sortable;
        dateDisplay = parsed.display;
      } else {
        lastModified = stat.mtime.toISOString();
        dateDisplay = stat.mtime.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      }
    } else {
      // Images and other assets that sit next to posts.
      lastModified = stat.mtime.toISOString();
    }

    nodes.push({
      articlePath: path.relative(process.cwd(), fullPath),
      id: fullPath,
      name: file,
      path: fullPath,
      parentPath,
      isDirectory,
      lastModified,
      dateDisplay,
      children,
    });
  }

  return nodes;
};

export default readDirectoryRecursively;
