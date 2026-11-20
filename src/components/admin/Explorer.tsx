"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, FileText, Layers, Plus, X } from "lucide-react";
import type { DocListItem, FolderInfo } from "@/app/admin/actions";

type Kind = "article" | "series" | "book";
export interface NewRequest {
  kind: Kind;
  section: string;
  title: string;
  folder?: string;
}

const SECTIONS = ["tech", "life", "thoughts"];
const KINDS: { kind: Kind; label: string; hint: string; icon: typeof FileText }[] = [
  { kind: "article", label: "Article", hint: "One standalone piece", icon: FileText },
  { kind: "series", label: "Series", hint: "Related articles under one title", icon: Layers },
  { kind: "book", label: "Book", hint: "Ordered chapters, written over time", icon: BookOpen },
];

const pretty = (s: string) => s.replace(/[-_]+/g, " ").replace(/^./, (c) => c.toUpperCase());
const field = "w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-text";
const lbl = "mb-1 block font-mono text-[11px] uppercase tracking-wider text-subtle";

interface Folder {
  path: string;
  kind: "book" | "series";
  title: string;
  docs: DocListItem[];
}
interface Section {
  name: string;
  folders: Folder[];
  loose: DocListItem[];
  count: number;
}

function buildTree(docs: DocListItem[], folders: FolderInfo[]): Section[] {
  const info = new Map(folders.map((f) => [f.path, f]));
  const names = Array.from(new Set([...SECTIONS, ...docs.map((d) => d.slug[0])]));
  return names.map((name) => {
    const mine = docs.filter((d) => d.slug[0] === name);
    const loose = mine.filter((d) => d.slug.length === 2).sort((a, b) => (a.date < b.date ? 1 : -1));
    const byFolder = new Map<string, DocListItem[]>();
    for (const d of mine.filter((d) => d.slug.length > 2)) {
      const p = d.slug.slice(0, 2).join("/");
      byFolder.set(p, [...(byFolder.get(p) ?? []), d]);
    }
    // Books that exist but have no chapters yet still show up.
    for (const f of folders) if (f.path.startsWith(name + "/") && !byFolder.has(f.path)) byFolder.set(f.path, []);
    const list: Folder[] = Array.from(byFolder.entries()).map(([path, ds]) => {
      const meta = info.get(path);
      return {
        path,
        kind: meta?.kind ?? "series",
        title: meta?.title || pretty(path.split("/")[1]),
        docs: ds.sort((a, b) => (a.date < b.date ? -1 : 1)),
      };
    });
    list.sort((a, b) => a.title.localeCompare(b.title));
    return { name, folders: list, loose, count: mine.length };
  });
}

export default function Explorer({
  docs,
  folders,
  active,
  onCreate,
  error,
}: {
  docs: DocListItem[];
  folders: FolderInfo[];
  active?: string;
  onCreate: (r: NewRequest) => void;
  error: string | null;
}) {
  const tree = useMemo(() => buildTree(docs, folders), [docs, folders]);
  const activeParts = active?.split("/") ?? [];

  // Open folders are remembered in this browser. The open file's ancestors are always opened.
  const [open, setOpen] = useState<Set<string>>(() => {
    const s = new Set<string>();
    if (activeParts.length) {
      s.add(activeParts[0]);
      if (activeParts.length > 2) s.add(activeParts.slice(0, 2).join("/"));
    }
    return s;
  });
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("admin:open") ?? "[]") as string[];
      setOpen((cur) => new Set([...Array.from(cur), ...saved]));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const toggle = (id: string) =>
    setOpen((cur) => {
      const next = new Set(cur);
      next.has(id) ? next.delete(id) : next.add(id);
      try {
        localStorage.setItem("admin:open", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });

  // New menu
  const [menu, setMenu] = useState(false);
  const [form, setForm] = useState<NewRequest | null>(null);
  const start = (kind: Kind, folder?: string) => {
    setMenu(false);
    setForm({ kind, section: folder?.split("/")[0] ?? activeParts[0] ?? "tech", title: "", folder });
  };
  const sectionFolders = form ? tree.find((s) => s.name === form.section)?.folders ?? [] : [];

  const row = "flex min-w-0 items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted";

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex items-center justify-between border-b border-border px-3 py-2.5">
        <span className="font-mono text-xs uppercase tracking-wider text-subtle">writings · {docs.length}</span>
        <button
          onClick={() => setMenu((m) => !m)}
          aria-expanded={menu}
          className="flex items-center gap-1 bg-brand px-2.5 py-1 text-sm font-semibold text-brand-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New
        </button>
        {menu && (
          <div className="absolute right-3 top-full z-20 mt-1 w-64 border border-border bg-background shadow-lg">
            {KINDS.map((k) => (
              <button key={k.kind} onClick={() => start(k.kind)} className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-muted">
                <k.icon className="mt-0.5 h-4 w-4 flex-none text-brand-text" />
                <span>
                  <span className="block text-sm font-semibold">{k.label}</span>
                  <span className="block text-xs text-muted-foreground">{k.hint}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {form && (
        <div className="border-b border-border bg-card/50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold">New {form.kind}{form.folder ? ` in ${pretty(form.folder.split("/")[1])}` : ""}</span>
            <button onClick={() => setForm(null)} aria-label="Cancel"><X className="h-4 w-4 text-subtle" /></button>
          </div>
          {!form.folder && (
            <>
              <span className={lbl}>section</span>
              <div className="mb-3 flex border border-border">
                {SECTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm((f) => f && { ...f, section: s, folder: undefined })}
                    className={`flex-1 py-1.5 text-sm ${form.section === s ? "bg-brand font-semibold text-brand-foreground" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}
          <label className={lbl} htmlFor="nt">{form.kind === "article" ? "title" : `${form.kind} title`}</label>
          <input
            id="nt"
            autoFocus
            value={form.title}
            onChange={(e) => { const title = e.target.value; setForm((f) => f && { ...f, title }); }}
            onKeyDown={(e) => e.key === "Enter" && onCreate(form)}
            className={field}
            placeholder={form.kind === "book" ? "e.g. The Kernel, Slowly" : "A good title"}
          />
          {form.kind === "article" && sectionFolders.length > 0 && !form.folder && (
            <>
              <label className={`${lbl} mt-3`} htmlFor="nf">put it in</label>
              <select id="nf" value="" onChange={(e) => { const folder = e.target.value || undefined; setForm((f) => f && { ...f, folder }); }} className={field}>
                <option value="">standalone</option>
                {sectionFolders.map((f) => <option key={f.path} value={f.path}>{f.kind} · {f.title}</option>)}
              </select>
            </>
          )}
          {form.kind !== "article" && (
            <p className="mt-2 text-xs text-muted-foreground">
              {form.kind === "book" ? "Starts with Chapter 1. Add more chapters from the book's + button." : "Starts with Part 1. Add more from the series' + button."}
            </p>
          )}
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          <button onClick={() => onCreate(form)} className="mt-3 w-full bg-brand py-2 text-sm font-semibold text-brand-foreground hover:opacity-90">
            Create {form.kind}
          </button>
        </div>
      )}

      <nav aria-label="Writings" className="min-h-0 flex-1 overflow-y-auto py-1">
        {tree.map((sec) => {
          const secOpen = open.has(sec.name);
          return (
            <div key={sec.name}>
              <button onClick={() => toggle(sec.name)} aria-expanded={secOpen} className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted">
                <ChevronRight className={`h-4 w-4 flex-none text-subtle transition-transform ${secOpen ? "rotate-90" : ""}`} />
                <span className="font-display text-[15px] font-semibold">{sec.name}</span>
                <span className="ml-auto font-mono text-xs text-subtle">{sec.count}</span>
              </button>
              {secOpen && (
                <div className="mb-1 ml-[18px] border-l border-border">
                  {sec.folders.map((f) => {
                    const fOpen = open.has(f.path);
                    const Icon = f.kind === "book" ? BookOpen : Layers;
                    return (
                      <div key={f.path}>
                        <div className="group flex items-center">
                          <button onClick={() => toggle(f.path)} aria-expanded={fOpen} title={`${f.kind}: ${f.title}`} className={`${row} flex-1`}>
                            <ChevronRight className={`h-3.5 w-3.5 flex-none text-subtle transition-transform ${fOpen ? "rotate-90" : ""}`} />
                            <Icon className="h-4 w-4 flex-none text-brand-text" />
                            <span className="truncate font-medium">{f.title}</span>
                            <span className="ml-auto flex-none font-mono text-[11px] text-subtle">{f.docs.length}</span>
                          </button>
                          <button
                            onClick={() => start("article", f.path)}
                            title={f.kind === "book" ? "Add a chapter" : "Add to this series"}
                            aria-label={f.kind === "book" ? "Add a chapter" : "Add to this series"}
                            className="px-2 py-1.5 text-subtle hover:bg-muted hover:text-brand-text"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        {fOpen && (
                          <div className="ml-[22px] border-l border-border">
                            {f.docs.map((d, i) => (
                              <DocRow key={d.slug.join("/")} d={d} active={d.slug.join("/") === active} n={f.kind === "book" ? i + 1 : undefined} />
                            ))}
                            {f.docs.length === 0 && <div className="px-3 py-1.5 text-xs text-subtle">No chapters yet</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {sec.loose.map((d) => (
                    <DocRow key={d.slug.join("/")} d={d} active={d.slug.join("/") === active} />
                  ))}
                  {sec.count === 0 && <div className="px-3 py-1.5 text-xs text-subtle">Nothing here yet</div>}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

function DocRow({ d, active, n }: { d: DocListItem; active: boolean; n?: number }) {
  return (
    <Link
      href={`/admin/${d.slug.join("/")}`}
      title={d.slug.join("/")}
      className={`flex min-w-0 items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted ${active ? "bg-muted font-semibold text-brand-text" : ""}`}
    >
      {n != null ? (
        <span className="w-4 flex-none font-mono text-[11px] text-subtle">{n}</span>
      ) : (
        <FileText className="h-3.5 w-3.5 flex-none text-subtle" />
      )}
      <span className="truncate">{d.title}</span>
      {d.draft && <span className="ml-auto flex-none font-mono text-[10px] uppercase text-brand-text">draft</span>}
    </Link>
  );
}
