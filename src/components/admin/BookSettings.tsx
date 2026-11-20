"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import { saveBook, type BookDoc } from "@/app/(site)/admin/actions";

const field = "w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-text";
const lbl = "mb-1 block font-mono text-[11px] uppercase tracking-wider text-subtle";

/** A book's title, description, status and chapter order. */
export default function BookSettings({ book }: { book: BookDoc }) {
  const router = useRouter();
  const [title, setTitle] = useState(book.title);
  const [description, setDescription] = useState(book.description);
  const [status, setStatus] = useState(book.status);
  const [chapters, setChapters] = useState(book.chapters);
  const [state, setState] = useState<"saved" | "dirty" | "saving" | "error">("saved");
  const [err, setErr] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const dirty = () => setState("dirty");

  const move = (i: number, by: -1 | 1) => {
    const j = i + by;
    if (j < 0 || j >= chapters.length) return;
    const next = [...chapters];
    [next[i], next[j]] = [next[j], next[i]];
    setChapters(next);
    dirty();
  };

  const save = () => {
    setState("saving");
    setErr(null);
    startTransition(async () => {
      try {
        await saveBook(book.folder, { title, description, status, chapters: chapters.map((c) => c.name) });
        setState("saved");
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Could not save");
        setState("error");
      }
    });
  };

  const published = chapters.filter((c) => !c.draft).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-4 py-2.5">
        <div className="min-w-0 flex-1 truncate font-mono text-xs text-subtle">writings/{book.folder.join("/")} · book</div>
        <span className={`font-mono text-xs ${state === "error" ? "text-red-500" : state === "saved" ? "text-subtle" : "text-brand-text"}`}>
          {{ saved: "saved", dirty: "unsaved", saving: "saving…", error: "not saved" }[state]}
        </span>
        <span className="font-mono text-xs text-subtle">{published} of {chapters.length} published</span>
        {published > 0 && (
          <Link href={`/writings/${book.folder.join("/")}`} className="font-mono text-xs text-subtle hover:text-brand-text">open live ↗</Link>
        )}
        <button onClick={save} disabled={state === "saved" || state === "saving"} className="bg-brand px-3 py-1.5 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-40">
          Save book
        </button>
      </div>
      {err && <div className="border-b border-border px-4 py-2 text-sm text-red-500">{err}</div>}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid max-w-3xl gap-5 px-4 py-6 sm:px-8">
          <div>
            <label className={lbl} htmlFor="bt">book title</label>
            <input id="bt" className={`${field} text-base`} value={title} onChange={(e) => { setTitle(e.target.value); dirty(); }} />
          </div>
          <div>
            <label className={lbl} htmlFor="bd">description (shown on the book page and in search results)</label>
            <textarea id="bd" rows={3} className={field} value={description} onChange={(e) => { setDescription(e.target.value); dirty(); }} />
          </div>
          <div>
            <span className={lbl}>status</span>
            <div className="flex max-w-sm border border-border" role="radiogroup" aria-label="Status">
              {(["writing", "complete"] as const).map((s) => (
                <button
                  key={s}
                  role="radio"
                  aria-checked={status === s}
                  onClick={() => { setStatus(s); dirty(); }}
                  className={`flex-1 py-2 text-sm ${status === s ? "bg-brand font-semibold text-brand-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  {s === "writing" ? "In progress" : "Complete"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className={lbl}>chapters · reading order</span>
            <ol className="border border-border">
              {chapters.map((c, i) => (
                <li key={c.name} className="flex items-center gap-3 border-b border-border px-3 py-2 last:border-b-0">
                  <span className="w-6 flex-none font-mono text-xs text-subtle">{i + 1}</span>
                  <Link href={`/admin/${c.slug.join("/")}`} className="min-w-0 flex-1 truncate text-sm hover:text-brand-text">{c.title}</Link>
                  {c.draft && <span className="flex-none font-mono text-[10px] uppercase text-brand-text">draft</span>}
                  <button onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${c.title} up`} className="p-1 text-subtle hover:text-foreground disabled:opacity-25">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => move(i, 1)} disabled={i === chapters.length - 1} aria-label={`Move ${c.title} down`} className="p-1 text-subtle hover:text-foreground disabled:opacity-25">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ol>
            <p className="mt-2 text-xs text-muted-foreground">
              Drafts keep their place but stay hidden on the site until published. Add a chapter with the + next to the book in the file list.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
