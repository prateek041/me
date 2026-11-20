import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";
import readDirectoryRecursively, { isPostFile, type FileSystemNode } from "@/app/(site)/writings/api/blog";
import { getSlugFromNode } from "@/app/(site)/writings/api/tree";
import { calendarDay } from "@/lib/dates";

export const WRITINGS_DIR = path.join(process.cwd(), "writings");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const SHOW_DRAFTS = process.env.NODE_ENV !== "production";

// Every frontmatter key a post may use. A typo (e.g. "desciption") fails the build.
const KNOWN_KEYS = new Set([
  "title",
  "description",
  "date",
  "modifiedDate",
  "status",
  "tags",
  "keywords",
  "draft",
]);

export interface Heading {
  id: string;
  text: string;
  depth: 2 | 3;
}

export interface PostMeta {
  slug: string[];
  section: string;
  title: string;
  description: string;
  date: string; // ISO
  modifiedDate?: string; // ISO
  status?: string;
  tags: string[];
  keywords?: string[];
  draft: boolean;
  readMinutes: number;
  headings: Heading[];
}

function fail(file: string, msg: string): never {
  throw new Error(`${path.relative(process.cwd(), file)}: ${msg}`);
}

function parseDate(file: string, key: string, value: unknown): Date {
  const d = calendarDay(value);
  if (!d) fail(file, `"${key}" is not a valid date: ${JSON.stringify(value)}`);
  return d;
}

function stringList(file: string, key: string, value: unknown): string[] | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return [value];
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) return value;
  fail(file, `"${key}" must be a string or a list of strings`);
}

function parseMeta(file: string, slug: string[], fm: Record<string, unknown>, body: string): PostMeta {
  for (const key of Object.keys(fm)) {
    if (!KNOWN_KEYS.has(key)) fail(file, `unknown frontmatter key "${key}". Allowed: ${Array.from(KNOWN_KEYS).join(", ")}`);
  }
  if (typeof fm.title !== "string" || !fm.title.trim()) fail(file, `"title" is required`);
  if (fm.date == null) fail(file, `"date" is required`);
  if (fm.description != null && typeof fm.description !== "string") fail(file, `"description" must be text`);
  if (fm.draft != null && typeof fm.draft !== "boolean") fail(file, `"draft" must be true or false`);

  const date = parseDate(file, "date", fm.date);

  return {
    slug,
    section: slug[0] ?? "",
    title: fm.title.trim(),
    description: (fm.description as string | undefined)?.trim() ?? "",
    date: date.toISOString(),
    modifiedDate: fm.modifiedDate != null ? parseDate(file, "modifiedDate", fm.modifiedDate).toISOString() : undefined,
    status: typeof fm.status === "string" ? fm.status : undefined,
    tags: stringList(file, "tags", fm.tags) ?? [],
    keywords: stringList(file, "keywords", fm.keywords),
    draft: fm.draft === true,
    readMinutes: Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 220)),
    headings: headingsOf(body),
  };
}

/**
 * ## and ### headings for the table of contents. The ids match the ones
 * rehype-slug puts on the rendered headings, so every heading level is
 * slugged in order (duplicates get -1, -2 ...) even though only 2-3 are kept.
 */
function headingsOf(source: string): Heading[] {
  const slugger = new GithubSlugger();
  const out: Heading[] = [];
  let fence: string | null = null;
  for (const line of source.split("\n")) {
    const f = line.match(/^\s*(```|~~~)/);
    if (f) {
      if (!fence) fence = f[1];
      else if (f[1] === fence) fence = null;
      continue;
    }
    if (fence) continue;
    const m = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!m) continue;
    const text = m[2]
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // [text](url) -> text
      .replace(/[`*_]/g, "")
      .trim();
    const id = slugger.slug(text);
    const depth = m[1].length;
    if (depth === 2 || depth === 3) out.push({ id, text, depth });
  }
  return out;
}

/** Absolute path of the post file for a slug, or null if there is none. */
function fileForSlug(slug: string[]): string | null {
  const base = path.join(WRITINGS_DIR, ...slug);
  if (!base.startsWith(WRITINGS_DIR + path.sep)) return null;
  for (const ext of [".mdx", ".md"]) {
    const file = base + ext;
    if (fs.existsSync(file) && isPostFile(path.basename(file))) return file;
  }
  return null;
}

export function getPostMeta(slug: string[]): PostMeta | null {
  const file = fileForSlug(slug);
  if (!file) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const meta = parseMeta(file, slug, data, content);
  return SHOW_DRAFTS || !meta.draft ? meta : null;
}

/** Metadata plus the compiled post component. */
export async function getPost(slug: string[]) {
  const meta = getPostMeta(slug);
  if (!meta) return null;
  const rel = slug.join("/");
  // Two literal patterns so webpack bundles every .md and .mdx under /writings.
  const mod = (fileForSlug(slug)!.endsWith(".mdx")
    ? await import(`../../writings/${rel}.mdx`)
    : await import(`../../writings/${rel}.md`)) as { default: ComponentType<{ components?: MDXComponents }> };
  return { meta, Content: mod.default };
}

export function getTree(): FileSystemNode[] {
  return readDirectoryRecursively(WRITINGS_DIR);
}

function postNodes(nodes: FileSystemNode[]): FileSystemNode[] {
  return nodes.flatMap((n) => (n.isDirectory ? postNodes(n.children ?? []) : isPostFile(n.name) ? [n] : []));
}

/** Every visible post, newest first. */
export function getAllPosts(): PostMeta[] {
  return postNodes(getTree())
    .map((n) => getPostMeta(getSlugFromNode(n)))
    .filter((m): m is PostMeta => m !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** The previous and next post in the same section (tech / thoughts / life), by date. */
export function getAdjacentPosts(meta: PostMeta) {
  const inSection = getAllPosts().filter((p) => p.section === meta.section);
  const i = inSection.findIndex((p) => p.slug.join("/") === meta.slug.join("/"));
  return {
    newer: i > 0 ? inSection[i - 1] : undefined,
    older: i >= 0 && i < inSection.length - 1 ? inSection[i + 1] : undefined,
  };
}

// ---------------------------------------------------------------------------
// Helpers used by the page layouts
// ---------------------------------------------------------------------------

// The one place the site address lives (sitemap script and robots.txt repeat it).
export const SITE_URL = "https://prateeksingh.life";
/** The e-reader / Instapaper edition of the writings. */
export const READER_URL = "https://e-read.prateeksingh.life";
/** Instapaper's "save this page" link. */
export const instapaperHref = (url: string) => `https://www.instapaper.com/hello2?url=${encodeURIComponent(url)}`;

export const postHref = (p: { slug: string[] }) => `/writings/${p.slug.join("/")}`;

export function formatDate(iso: string, style: "long" | "short" | "day" | "month" = "long") {
  const d = new Date(iso);
  const opts: Intl.DateTimeFormatOptions =
    style === "long"
      ? { year: "numeric", month: "long", day: "numeric" }
      : style === "short"
        ? { year: "numeric", month: "short", day: "numeric" }
        : style === "day"
          ? { month: "short", day: "numeric" }
          : { year: "numeric", month: "short" };
  return d.toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
}

const TITLES: Record<string, string> = {
  ebpf: "eBPF",
  cs: "Computer science",
  graphQL: "GraphQL",
  "llm-101": "LLM 101",
  "building-senseii": "Building Senseii",
};

/** "linux-networking" -> "Linux networking" */
export function prettify(segment: string) {
  return TITLES[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

/** A folder holding a `_book.json` is a book (see src/lib/books.ts), not a series. */
export function isBookFolder(folder: string[]): boolean {
  return fs.existsSync(path.join(WRITINGS_DIR, ...folder, "_book.json"));
}

/** A series is any other folder of posts (e.g. tech/ebpf). Posts in it are numbered in order. */
export function getSeriesPosts(meta: PostMeta): PostMeta[] | null {
  if (meta.slug.length < 3 || isBookFolder(meta.slug.slice(0, 2))) return null;
  const prefix = meta.slug.slice(0, 2).join("/") + "/";
  const posts = getAllPosts()
    .filter((p) => p.slug.join("/").startsWith(prefix))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  return posts.length > 1 ? posts : null;
}

export interface SeriesInfo {
  id: string;
  title: string;
  count: number;
  first: string;
  last: string;
  href: string;
}

export function getSeriesList(): SeriesInfo[] {
  const groups = new Map<string, PostMeta[]>();
  for (const p of getAllPosts()) {
    if (p.slug.length < 3 || isBookFolder(p.slug.slice(0, 2))) continue;
    const id = p.slug.slice(0, 2).join("/");
    groups.set(id, [...(groups.get(id) ?? []), p]);
  }
  return Array.from(groups.entries())
    .filter(([, posts]) => posts.length > 1)
    .map(([id, posts]) => {
      const asc = [...posts].sort((a, b) => (a.date < b.date ? -1 : 1));
      return {
        id,
        title: prettify(id.split("/")[1]),
        count: posts.length,
        first: asc[0].date,
        last: asc[asc.length - 1].date,
        href: postHref(asc[0]),
      };
    })
    .sort((a, b) => b.count - a.count);
}

/** Entry numbers for the paper theme: [1] is the oldest post. */
export function getPostNumbers(): Map<string, number> {
  const asc = [...getAllPosts()].sort((a, b) => (a.date < b.date ? -1 : 1));
  return new Map(asc.map((p, i) => [p.slug.join("/"), i + 1]));
}

/** The header image for a post, if one exists in /public (same path as the post, .jpg). */
export function getHeaderImage(meta: PostMeta): string | null {
  const rel = meta.slug.join("/") + ".jpg";
  return fs.existsSync(path.join(PUBLIC_DIR, rel)) ? "/" + rel : null;
}
