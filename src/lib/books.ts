import fs from "node:fs";
import path from "node:path";
import { getAllPosts, postHref, prettify, WRITINGS_DIR, type PostMeta } from "@/lib/writings";

/*
 * A book is a folder under a section (tech, thoughts or life) with a `_book.json`:
 *
 *   { "title": "...", "description": "...", "status": "writing" | "complete",
 *     "chapters": ["chapter-1", "the-second-one", ...] }
 *
 * `chapters` is the reading order (file names without .md/.mdx), set in the editor.
 * Chapter files missing from it come after, oldest first. Only published chapters
 * are shown in production, so a book with none published does not exist there.
 * An optional cover image lives at public/<section>/<book>.jpg.
 */

export type BookStatus = "writing" | "complete";

export interface BookFile {
  title?: string;
  description?: string;
  status?: BookStatus;
  chapters?: string[];
}

export interface Book {
  id: string; // "life/my-book"
  slug: string[]; // ["life", "my-book"]
  section: string;
  title: string;
  description: string;
  status: BookStatus;
  chapters: PostMeta[]; // visible chapters, in reading order
  cover: string | null;
  readMinutes: number;
  started: string; // ISO date of the earliest chapter
  updated: string; // ISO date of the latest chapter
}

const PUBLIC_DIR = path.join(process.cwd(), "public");

export function readBookFile(folder: string[]): BookFile | null {
  const file = path.join(WRITINGS_DIR, ...folder, "_book.json");
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as BookFile;
  } catch {
    throw new Error(`${path.relative(process.cwd(), file)} is not valid JSON`);
  }
}

/** Chapters in reading order: the `chapters` list first, then any others oldest first. */
export function orderChapters<T extends { slug: string[]; date: string }>(posts: T[], order: string[] = []): T[] {
  const rank = (p: T) => {
    const i = order.indexOf(p.slug[p.slug.length - 1]);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...posts].sort((a, b) => rank(a) - rank(b) || (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

function buildBook(folder: string[], file: BookFile, posts: PostMeta[]): Book | null {
  const prefix = folder.join("/") + "/";
  const chapters = orderChapters(
    posts.filter((p) => p.slug.length === folder.length + 1 && p.slug.join("/").startsWith(prefix)),
    file.chapters
  );
  if (!chapters.length) return null;
  const dates = chapters.map((c) => c.date).sort();
  const cover = folder.join("/") + ".jpg";
  return {
    id: folder.join("/"),
    slug: folder,
    section: folder[0],
    title: file.title?.trim() || prettify(folder[folder.length - 1]),
    description: file.description?.trim() ?? "",
    status: file.status === "complete" ? "complete" : "writing",
    chapters,
    cover: fs.existsSync(path.join(PUBLIC_DIR, cover)) ? "/" + cover : null,
    readMinutes: chapters.reduce((n, c) => n + c.readMinutes, 0),
    started: dates[0],
    updated: dates[dates.length - 1],
  };
}

/** Every book with at least one visible chapter, most recently updated first. */
export function getBooks(): Book[] {
  const posts = getAllPosts();
  const out: Book[] = [];
  for (const section of fs.readdirSync(WRITINGS_DIR)) {
    const dir = path.join(WRITINGS_DIR, section);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const name of fs.readdirSync(dir)) {
      const folder = [section, name];
      const file = fs.statSync(path.join(dir, name)).isDirectory() ? readBookFile(folder) : null;
      const book = file && buildBook(folder, file, posts);
      if (book) out.push(book);
    }
  }
  return out.sort((a, b) => (a.updated < b.updated ? 1 : -1));
}

export function getBook(folder: string[]): Book | null {
  if (folder.length !== 2) return null;
  const file = readBookFile(folder);
  return file && buildBook(folder, file, getAllPosts());
}

export const bookHref = (b: { slug: string[] }) => `/writings/${b.slug.join("/")}`;

export interface ChapterContext {
  book: Book;
  index: number; // 0-based
  prev?: PostMeta;
  next?: PostMeta;
}

/** If this post is a chapter of a book: the book, its position and its neighbours. */
export function getChapterContext(meta: PostMeta): ChapterContext | null {
  if (meta.slug.length !== 3) return null;
  const book = getBook(meta.slug.slice(0, 2));
  if (!book) return null;
  const index = book.chapters.findIndex((c) => c.slug.join("/") === meta.slug.join("/"));
  if (index === -1) return null;
  return { book, index, prev: book.chapters[index - 1], next: book.chapters[index + 1] };
}

export const statusLabel = (b: Book) =>
  b.status === "complete" ? `Complete · ${b.chapters.length} chapters` : "In progress · more chapters coming";

/** Map of chapter slug -> its book title and 1-based chapter number. */
export function getChapterMap(): Map<string, { book: string; n: number }> {
  return new Map(getBooks().flatMap((b) => b.chapters.map((c, i) => [c.slug.join("/"), { book: b.title, n: i + 1 }] as const)));
}

export { postHref };
