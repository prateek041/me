"use server";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkEmoji from "remark-emoji";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import remarkCallouts from "@/lib/remark-callouts.mjs";
import { components } from "@/mdx-components";
import { WRITINGS_DIR, getAllPosts } from "@/lib/writings";

// Local mode: the editor reads and writes the files in /writings directly.
// It is switched off in production builds. The deployed version will talk to
// GitHub instead (drafts branch for autosave, main for publish).
function assertLocal() {
  if (process.env.NODE_ENV === "production") throw new Error("The editor is only available locally for now.");
  // The dev server can be exposed through a tunnel; never let a tunnelled request write files.
  const host = (headers().get("host") ?? "").split(":")[0];
  if (host !== "localhost" && host !== "127.0.0.1") throw new Error("The editor only works on localhost.");
}

const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9 _.-]*$/;

function resolveFile(slug: string[], create = false): string {
  if (!slug.length || !slug.every((s) => SEGMENT.test(s) && !s.includes(".."))) throw new Error("Invalid path");
  const base = path.resolve(WRITINGS_DIR, ...slug);
  if (!base.startsWith(WRITINGS_DIR + path.sep)) throw new Error("Invalid path");
  for (const ext of [".mdx", ".md"]) if (fs.existsSync(base + ext)) return base + ext;
  if (!create) throw new Error("Not found");
  return base + ".mdx";
}

export interface DocListItem {
  slug: string[];
  title: string;
  draft: boolean;
  date: string;
  words: number;
}

export async function listDocs(): Promise<DocListItem[]> {
  assertLocal();
  return getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    draft: p.draft,
    date: p.date,
    words: p.readMinutes * 220,
  }));
}

export interface Doc {
  slug: string[];
  fm: Record<string, unknown>;
  body: string;
  mtime: number;
}

export async function loadDoc(slug: string[]): Promise<Doc> {
  assertLocal();
  const file = resolveFile(slug);
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const fm: Record<string, unknown> = { ...data };
  for (const k of ["date", "modifiedDate"]) {
    if (fm[k] instanceof Date) fm[k] = (fm[k] as Date).toISOString().slice(0, 10);
  }
  return { slug, fm, body: content.replace(/^\n+/, ""), mtime: fs.statSync(file).mtimeMs };
}

export async function saveDoc(slug: string[], fm: Record<string, unknown>, body: string) {
  assertLocal();
  const file = resolveFile(slug, true);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const clean = Object.fromEntries(
    Object.entries(fm).filter(([, v]) => v !== "" && v != null && !(Array.isArray(v) && v.length === 0))
  );
  fs.writeFileSync(file, matter.stringify(body.replace(/\s+$/, "") + "\n", clean));
  revalidatePath("/writings");
  revalidatePath(`/writings/${slug.join("/")}`);
  return { mtime: fs.statSync(file).mtimeMs };
}

export interface FolderInfo {
  path: string; // e.g. "tech/my-book"
  kind: "book" | "series";
  title: string;
}

/** A folder holding a `_book.json` is a book. Any other folder of posts is a series. */
export async function listFolders(): Promise<FolderInfo[]> {
  assertLocal();
  const out: FolderInfo[] = [];
  const walk = (dir: string, rel: string[]) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (!fs.statSync(full).isDirectory()) continue;
      const here = [...rel, name];
      const meta = path.join(full, "_book.json");
      if (fs.existsSync(meta)) {
        let title = "";
        try {
          title = JSON.parse(fs.readFileSync(meta, "utf8")).title ?? "";
        } catch {}
        out.push({ path: here.join("/"), kind: "book", title });
      }
      if (here.length < 2) walk(full, here);
    }
  };
  walk(WRITINGS_DIR, []);
  return out;
}

const slugify = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "untitled";

// The local calendar day (toISOString would give the UTC day, i.e. yesterday in IST before 05:30).
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function firstPost(slug: string[], title: string) {
  return saveDoc(slug, { title, description: "", date: today(), draft: true }, "Start writing here.");
}

/**
 * article: one post, standalone or inside an existing book/series (`folder`).
 * series:  a folder of related articles, any order. Starts with one post.
 * book:    a folder with a `_book.json` and ordered chapters. Starts with chapter 1.
 * A book or series can live in any section.
 */
export async function createDoc(input: {
  kind: "article" | "series" | "book";
  section: string;
  title: string;
  folder?: string; // article only: "tech/my-book"
}): Promise<string[]> {
  assertLocal();
  const title = input.title.trim();
  if (!title) throw new Error("Give it a title");
  if (!SEGMENT.test(input.section)) throw new Error("Invalid section");
  const exists = (slug: string[]) => {
    try {
      resolveFile(slug);
      return true;
    } catch {
      return false;
    }
  };

  if (input.kind === "article") {
    const parent = input.folder ? input.folder.split("/") : [input.section];
    const slug = [...parent, slugify(title)];
    if (exists(slug)) throw new Error("An article with that name already exists there");
    await firstPost(slug, title);
    return slug;
  }

  const dir = path.resolve(WRITINGS_DIR, input.section, slugify(title));
  if (!dir.startsWith(WRITINGS_DIR + path.sep)) throw new Error("Invalid path");
  if (fs.existsSync(dir)) throw new Error("A folder with that name already exists");
  fs.mkdirSync(dir, { recursive: true });
  if (input.kind === "book") {
    fs.writeFileSync(path.join(dir, "_book.json"), JSON.stringify({ title, description: "", kind: "book" }, null, 2) + "\n");
  }
  const slug = [input.section, slugify(title), input.kind === "book" ? "chapter-1" : "part-1"];
  await firstPost(slug, input.kind === "book" ? "Chapter 1" : "Part 1");
  return slug;
}

/** Renders the MDX being written with the same plugins and components as the real post. */
export async function previewMdx(source: string) {
  assertLocal();
  try {
    const { content } = await compileMDX({
      source,
      components,
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkEmoji, remarkCallouts],
          rehypePlugins: [
            rehypeSlug,
            [rehypePrettyCode, { theme: { light: "github-light", dark: "github-dark" }, keepBackground: false, defaultLang: { block: "plaintext" } }],
          ],
        },
      },
    });
    return { ok: true as const, content };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
  }
}
