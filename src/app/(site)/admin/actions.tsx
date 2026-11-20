"use server";

import matter from "gray-matter";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkEmoji from "remark-emoji";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import remarkCallouts from "@/lib/remark-callouts.mjs";
import { components } from "@/mdx-components";
import { calendarDay } from "@/lib/dates";
import { orderChapters, type BookFile, type BookStatus } from "@/lib/books";
import { ConflictError, getStore, type StoredFile } from "@/lib/store";
import { canEdit, signOut } from "@/auth";

/*
 * The editor's server actions. They work on a content store (src/lib/store):
 * local files under `next dev`, GitHub when deployed (drafts branch for saves,
 * main for publishing). Every action checks that the caller may edit.
 */

async function guard() {
  if (!(await canEdit())) throw new Error("Not allowed");
}

const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9 _.-]*$/;

function checkSlug(slug: string[]) {
  if (!slug.length || !slug.every((s) => SEGMENT.test(s) && !s.includes(".."))) throw new Error("Invalid path");
}

/** One snapshot of the content per request. */
const snapshot = cache(async () => getStore().snapshot());

function pathFor(snap: Map<string, StoredFile>, slug: string[]): string | null {
  for (const ext of [".mdx", ".md"]) {
    const p = `writings/${slug.join("/")}${ext}`;
    if (snap.has(p)) return p;
  }
  return null;
}

const isPost = (p: string) => /\.mdx?$/.test(p) && !/\/[_.][^/]*$/.test(p);
const slugOf = (p: string) => p.replace(/^writings\//, "").replace(/\.mdx?$/, "").split("/");

function parse(text: string) {
  const { data, content } = matter(text);
  const fm: Record<string, unknown> = { ...data };
  for (const k of ["date", "modifiedDate"]) if (fm[k] instanceof Date) fm[k] = (fm[k] as Date).toISOString().slice(0, 10);
  return { fm, body: content.replace(/^\n+/, "") };
}

function serialize(fm: Record<string, unknown>, body: string) {
  const clean = Object.fromEntries(Object.entries(fm).filter(([, v]) => v !== "" && v != null && !(Array.isArray(v) && v.length === 0)));
  return matter.stringify(body.replace(/\s+$/, "") + "\n", clean);
}

export interface EditorInfo {
  mode: "local" | "github";
  syncError: string | null;
}

/** Called when the editor opens: GitHub mode first pulls anything pushed to main into drafts. */
export async function openEditor(): Promise<EditorInfo> {
  await guard();
  const store = getStore();
  let syncError: string | null = null;
  try {
    await store.sync();
  } catch (e) {
    syncError = e instanceof Error ? e.message : String(e);
  }
  return { mode: store.mode, syncError };
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

// ---------- posts ----------

export interface DocListItem {
  slug: string[];
  title: string;
  draft: boolean;
  date: string;
  words: number;
}

export async function listDocs(): Promise<DocListItem[]> {
  await guard();
  const out: DocListItem[] = [];
  for (const [p, f] of Array.from((await snapshot()).entries())) {
    if (!isPost(p)) continue;
    const { fm, body } = parse(f.text);
    out.push({
      slug: slugOf(p),
      title: typeof fm.title === "string" && fm.title.trim() ? fm.title.trim() : slugOf(p).slice(-1)[0],
      draft: fm.draft === true,
      date: calendarDay(fm.date)?.toISOString() ?? "",
      words: body.split(/\s+/).filter(Boolean).length,
    });
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export interface Doc {
  slug: string[];
  path: string;
  fm: Record<string, unknown>;
  body: string;
  version: string;
}

export async function loadDoc(slug: string[]): Promise<Doc | null> {
  await guard();
  checkSlug(slug);
  const snap = await snapshot();
  const p = pathFor(snap, slug);
  if (!p) return null;
  const f = snap.get(p)!;
  return { slug, path: p, ...parse(f.text), version: f.version };
}

export type SaveResult =
  | { ok: true; version: string }
  | { ok: false; conflict: true; theirs: Doc | null }
  | { ok: false; conflict: false; error: string };

async function conflictResult(slug: string[], path: string): Promise<SaveResult> {
  const f = await getStore().read(path);
  return { ok: false, conflict: true, theirs: f ? { slug, path, ...parse(f.text), version: f.version } : null };
}

/** Save the working copy (GitHub: a commit on drafts). `expected` = the version this edit started from. */
export async function saveDoc(path: string, fm: Record<string, unknown>, body: string, expected: string | null): Promise<SaveResult> {
  await guard();
  const slug = slugOf(path);
  checkSlug(slug);
  try {
    const { version } = await getStore().write(path, serialize(fm, body), { expected, message: `Draft: ${slug.join("/")}` });
    revalidatePath(`/writings/${slug.join("/")}`);
    return { ok: true, version };
  } catch (e) {
    if (e instanceof ConflictError) return conflictResult(slug, path);
    return { ok: false, conflict: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Publish (draft removed) or unpublish (draft: true): saves the working copy, then
 * puts it live (GitHub: one commit on main). A chapter's _book.json goes live with it.
 */
export async function setPublished(path: string, fm: Record<string, unknown>, body: string, expected: string | null, publish: boolean): Promise<SaveResult> {
  await guard();
  const slug = slugOf(path);
  checkSlug(slug);
  const next = { ...fm, draft: publish ? undefined : true };
  const text = serialize(next, body);
  const store = getStore();
  try {
    const { version } = await store.write(path, text, { expected, message: `${publish ? "Publish" : "Unpublish"}: ${slug.join("/")}` });
    await store.publish(path, text, `${publish ? "Publish" : "Unpublish"}: ${slug.join("/")}`, { onlyIfLive: !publish });
    if (publish && slug.length === 3) {
      const bookPath = `writings/${slug.slice(0, 2).join("/")}/_book.json`;
      const book = await store.read(bookPath);
      if (book) await store.publish(bookPath, book.text, `Publish book: ${slug.slice(0, 2).join("/")}`);
    }
    revalidatePath("/writings");
    revalidatePath(`/writings/${slug.join("/")}`);
    return { ok: true, version };
  } catch (e) {
    if (e instanceof ConflictError) return conflictResult(slug, path);
    return { ok: false, conflict: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// ---------- folders and creating ----------

export interface FolderInfo {
  path: string; // e.g. "tech/my-book"
  kind: "book" | "series";
  title: string;
  chapters?: string[]; // books: reading order (file names)
}

function readBookJson(snap: Map<string, StoredFile>, folder: string[]): { file: BookFile; version: string } | null {
  const f = snap.get(`writings/${folder.join("/")}/_book.json`);
  if (!f) return null;
  try {
    return { file: JSON.parse(f.text) as BookFile, version: f.version };
  } catch {
    return { file: {}, version: f.version };
  }
}

/** A folder holding a `_book.json` is a book. Any other folder of posts is a series. */
export async function listFolders(): Promise<FolderInfo[]> {
  await guard();
  const out: FolderInfo[] = [];
  for (const p of Array.from((await snapshot()).keys())) {
    const m = p.match(/^writings\/([^/]+\/[^/]+)\/_book\.json$/);
    if (!m) continue;
    const book = readBookJson(await snapshot(), m[1].split("/"));
    out.push({ path: m[1], kind: "book", title: book?.file.title ?? "", chapters: book?.file.chapters ?? [] });
  }
  return out;
}

const slugify = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "untitled";

// The local calendar day (toISOString would give the UTC day, i.e. yesterday in IST before 05:30).
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const bookJson = (data: BookFile) => JSON.stringify({ kind: "book", ...data }, null, 2) + "\n";

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
  await guard();
  const title = input.title.trim();
  if (!title) throw new Error("Give it a title");
  if (!SEGMENT.test(input.section)) throw new Error("Invalid section");
  const store = getStore();
  const snap = await store.snapshot();
  const newPost = async (slug: string[], postTitle: string) => {
    checkSlug(slug);
    if (pathFor(snap, slug)) throw new Error("Something with that name already exists there");
    await store.write(`writings/${slug.join("/")}.mdx`, serialize({ title: postTitle, description: "", date: today(), draft: true }, "Start writing here."), {
      expected: null,
      message: `New: ${slug.join("/")}`,
    });
  };

  if (input.kind === "article") {
    const parent = input.folder ? input.folder.split("/") : [input.section];
    const slug = [...parent, slugify(title)];
    await newPost(slug, title);
    // A new chapter goes to the end of its book's reading order.
    const book = readBookJson(snap, parent);
    if (book) {
      await store.write(`writings/${parent.join("/")}/_book.json`, bookJson({ ...book.file, chapters: [...(book.file.chapters ?? []), slug[slug.length - 1]] }), {
        expected: book.version,
        message: `Add chapter: ${slug.join("/")}`,
      });
    }
    return slug;
  }

  const folder = [input.section, slugify(title)];
  checkSlug(folder);
  if (Array.from(snap.keys()).some((p) => p.startsWith(`writings/${folder.join("/")}/`))) throw new Error("A folder with that name already exists");
  if (input.kind === "book") {
    await store.write(`writings/${folder.join("/")}/_book.json`, bookJson({ title, description: "", status: "writing", chapters: ["chapter-1"] }), {
      expected: null,
      message: `New book: ${folder.join("/")}`,
    });
  }
  const slug = [...folder, input.kind === "book" ? "chapter-1" : "part-1"];
  await newPost(slug, input.kind === "book" ? "Chapter 1" : "Part 1");
  return slug;
}

/** Renders the MDX being written with the same plugins and components as the real post. */
export async function previewMdx(source: string) {
  await guard();
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

// ---------- books ----------

export interface BookDoc {
  folder: string[];
  title: string;
  description: string;
  status: BookStatus;
  chapters: { name: string; slug: string[]; title: string; draft: boolean; date: string }[]; // reading order
}

/** A book and all its chapters (drafts included), in reading order. */
export async function loadBook(folder: string[]): Promise<BookDoc | null> {
  await guard();
  if (folder.length !== 2) return null;
  checkSlug(folder);
  const snap = await snapshot();
  const book = readBookJson(snap, folder);
  if (!book) return null;
  const prefix = `writings/${folder.join("/")}/`;
  const chapters = Array.from(snap.entries())
    .filter(([p]) => p.startsWith(prefix) && isPost(p) && p.slice(prefix.length).split("/").length === 1)
    .map(([p, f]) => {
      const { fm } = parse(f.text);
      const slug = slugOf(p);
      return {
        name: slug[2],
        slug,
        title: typeof fm.title === "string" ? fm.title : slug[2],
        draft: fm.draft === true,
        date: calendarDay(fm.date)?.toISOString() ?? "",
      };
    });
  return {
    folder,
    title: book.file.title ?? "",
    description: book.file.description ?? "",
    status: book.file.status === "complete" ? "complete" : "writing",
    chapters: orderChapters(chapters, book.file.chapters),
  };
}

/** Save a book's settings; if the book is already live, its settings go live too. */
export async function saveBook(folder: string[], data: { title: string; description: string; status: BookStatus; chapters: string[] }) {
  await guard();
  checkSlug(folder);
  const title = data.title.trim();
  if (!title) throw new Error("Give the book a title");
  const path = `writings/${folder.join("/")}/_book.json`;
  const text = bookJson({ title, description: data.description.trim(), status: data.status, chapters: data.chapters });
  const store = getStore();
  await store.write(path, text, { message: `Book settings: ${folder.join("/")}` });
  await store.publish(path, text, `Book settings: ${folder.join("/")}`, { onlyIfLive: true });
  revalidatePath("/writings");
  revalidatePath(`/writings/${folder.join("/")}`);
}
