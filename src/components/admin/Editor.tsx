"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { Maximize2, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createDoc, previewMdx, saveDoc, setPublished, signOutAction, type BookDoc, type Doc, type DocListItem, type EditorInfo, type FolderInfo, type SaveResult } from "@/app/(site)/admin/actions";
import BookSettings from "./BookSettings";
import DateField from "./DateField";
import Explorer, { type NewRequest } from "./Explorer";

type FM = Record<string, unknown>;
type Sync = "saved" | "dirty" | "saving" | "error";

// Unsaved edits are committed at most this often while typing (and always when leaving the page).
const AUTOSAVE_MS = 5 * 60 * 1000;


const field = "w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-text";
const lbl = "mb-1 block font-mono text-[11px] uppercase tracking-wider text-subtle";

export default function Editor({ docs, folders, doc, book, missing, info }: { docs: DocListItem[]; folders: FolderInfo[]; doc: Doc | null; book?: BookDoc | null; missing: boolean; info: EditorInfo }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [fm, setFm] = useState<FM>(doc?.fm ?? {});
  const [body, setBody] = useState(doc?.body ?? "");
  const [sync, setSync] = useState<Sync>("saved");
  const syncRef = useRef(sync);
  syncRef.current = sync;
  const [pane, setPane] = useState<"write" | "preview">("write");
  const [preview, setPreview] = useState<ReactNode>(null);
  const [previewErr, setPreviewErr] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  // The version this edit is based on. A save sends it; if another device saved since, the save is refused.
  const [version, setVersion] = useState<string | null>(doc?.version ?? null);
  const versionRef = useRef(version);
  versionRef.current = version;
  const [conflict, setConflict] = useState<{ theirs: Doc | null } | null>(null);
  const [staleLocal, setStaleLocal] = useState<{ fm: FM; body: string } | null>(null);
  const autosave = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const focusArea = useRef<HTMLTextAreaElement>(null);
  const [focus, setFocus] = useState(false);
  // Desktop sidebar, remembered in this browser. Ctrl/⌘ + \ toggles it.
  const [side, setSide] = useState(true);
  useEffect(() => {
    try {
      if (localStorage.getItem("admin:side") === "closed") setSide(false);
    } catch {}
  }, []);
  const toggleSide = () =>
    setSide((v) => {
      try {
        localStorage.setItem("admin:side", v ? "closed" : "open");
      } catch {}
      return !v;
    });
  const key = doc ? `draft:${doc.slug.join("/")}` : null;
  const latest = useRef({ fm, body });
  latest.current = { fm, body };

  // Unsaved text kept in this browser: restore it if it was based on the same saved version;
  // if the file was saved somewhere else since, ask instead of silently restoring.
  useEffect(() => {
    if (!key || !doc) return;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const saved = JSON.parse(raw) as { fm: FM; body: string; version?: string | null };
      const differs = saved.body !== doc.body || JSON.stringify(saved.fm) !== JSON.stringify(doc.fm);
      if (!differs) return localStorage.removeItem(key);
      if (saved.version === doc.version) {
        setFm(saved.fm);
        setBody(saved.body);
        setSync("dirty");
        setRestored(true);
      } else setStaleLocal({ fm: saved.fm, body: saved.body });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave to this browser on every change. Nothing leaves the device yet.
  useEffect(() => {
    if (!key || sync === "saved") return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify({ fm, body, version: versionRef.current, at: Date.now() }));
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [fm, body, key, sync]);

  // Live preview, rendered on the server with the real components and plugins.
  useEffect(() => {
    if (!doc) return;
    let stale = false;
    const t = setTimeout(async () => {
      const r = await previewMdx(body);
      if (stale) return;
      if (r.ok) {
        setPreview(r.content);
        setPreviewErr(null);
      } else setPreviewErr(r.error);
    }, 500);
    return () => {
      stale = true;
      clearTimeout(t);
    };
  }, [body, doc]);

  const handle = useCallback(
    (r: SaveResult, savedFm: FM) => {
      if (r.ok) {
        setVersion(r.version);
        versionRef.current = r.version;
        setFm(savedFm);
        if (key) localStorage.removeItem(key);
        setSync("saved");
        setRestored(false);
        setConflict(null);
        if (autosave.current) clearTimeout(autosave.current);
        autosave.current = null;
        return true;
      }
      if (r.conflict) setConflict({ theirs: r.theirs });
      else setErr(r.error);
      setSync("error");
      return false;
    },
    [key]
  );

  /** Save draft: a commit on the drafts branch (GitHub) or the file on disk (local). */
  const save = useCallback(
    async (expected?: string | null) => {
      if (!doc) return;
      setSync("saving");
      setErr(null);
      const f = latest.current.fm;
      try {
        handle(await saveDoc(doc.path, f, latest.current.body, expected === undefined ? versionRef.current : expected), f);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Could not save");
        setSync("error");
      }
    },
    [doc, handle]
  );

  /** Publish puts the post live (GitHub: one commit on main); unpublish hides it again. */
  const publish = async (on: boolean) => {
    if (!doc) return;
    setSync("saving");
    setErr(null);
    const f = { ...latest.current.fm, draft: on ? undefined : true };
    try {
      handle(await setPublished(doc.path, latest.current.fm, latest.current.body, versionRef.current, on), f);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not publish");
      setSync("error");
    }
  };

  // Autosave: once there are unsaved edits, commit them within AUTOSAVE_MS, and when leaving the page.
  useEffect(() => {
    if (sync !== "dirty" || autosave.current) return;
    autosave.current = setTimeout(() => {
      autosave.current = null;
      void save();
    }, AUTOSAVE_MS);
  }, [sync, save]);
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden" && syncRef.current === "dirty") void save();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      if (autosave.current) clearTimeout(autosave.current);
    };
  }, [save]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "Enter" && doc) {
        e.preventDefault();
        setFocusMode(!focus);
      }
      if (e.key === "Escape" && focus) {
        e.preventDefault();
        setFocusMode(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        toggleSide();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [save, focus, doc]);

  const setField = (k: string, v: unknown) => {
    setFm((f) => ({ ...f, [k]: v }));
    setSync("dirty");
  };
  const onBody = (v: string) => {
    setBody(v);
    setSync("dirty");
  };

  // Focus mode: a full-screen page with only the title and the text. The cursor carries over both ways.
  const setFocusMode = (on: boolean) => {
    if (on === focus) return;
    const from = focus ? focusArea.current : area.current;
    const at = from ? [from.selectionStart, from.selectionEnd] : [body.length, body.length];
    setFocus(on);
    requestAnimationFrame(() => {
      const to = on ? focusArea.current : area.current;
      if (!to) return;
      to.focus();
      to.setSelectionRange(at[0], at[1]);
    });
  };

  useEffect(() => {
    if (!focus) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [focus]);

  // The focus textarea grows with the text, so the whole page scrolls like a document.
  useLayoutEffect(() => {
    const el = focusArea.current;
    if (!focus || !el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [focus, body]);

  const insert = (run: (sel: string) => { text: string }) => {
    const el = focus ? focusArea.current : area.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const { text } = run(body.slice(a, b));
    onBody(body.slice(0, a) + text + body.slice(b));
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = a + text.length;
    });
  };

  const onTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    insert(() => ({ text: "  " }));
  };

  const create = (r: NewRequest) => {
    setErr(null);
    startTransition(async () => {
      try {
        const slug = await createDoc(r);
        router.push(`/admin/${slug.join("/")}`);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Could not create");
      }
    });
  };

  const words = useMemo(() => body.split(/\s+/).filter(Boolean).length, [body]);
  const isDraft = fm.draft === true;
  const tags = Array.isArray(fm.tags) ? (fm.tags as string[]).join(", ") : "";
  const active = doc?.slug.join("/") ?? book?.folder.join("/");

  const syncLabel = {
    saved: info.mode === "github" ? "saved to drafts" : "saved to disk",
    dirty: "unsaved · kept in this browser · autosaves soon",
    saving: "saving…",
    error: "not saved",
  }[sync];
  const syncColor = sync === "saved" ? "text-subtle" : sync === "error" ? "text-red-500" : "text-brand-text";

  const statusBar = (info.mode === "github" || info.syncError) && (
    <div className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 pt-3 font-mono text-xs text-subtle sm:px-5">
      <span>
        {info.mode === "github" ? "editing on GitHub · saves go to the drafts branch, Publish goes live" : "editing local files"}
        {info.syncError && <span className="ml-3 text-red-500">sync with main failed: {info.syncError}</span>}
      </span>
      {info.mode === "github" && (
        <form action={signOutAction}>
          <button className="underline hover:text-foreground">sign out</button>
        </form>
      )}
    </div>
  );

  return (
    <>
    {statusBar}
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-0 px-3 py-3 sm:px-5 lg:h-[calc(100vh-9rem)] lg:flex-row">
      {focus && doc && (
        <div role="dialog" aria-modal="true" aria-label="Focus writing" className="fixed inset-0 z-[100] overflow-y-auto bg-background">
          <button
            onClick={() => setFocusMode(false)}
            aria-label="Leave focus mode"
            className="fixed right-4 top-4 p-2 text-subtle opacity-40 transition-opacity hover:opacity-100 focus-visible:opacity-100"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mx-auto w-full max-w-[68ch] px-6 pb-[40vh] pt-[14vh]">
            <input
              value={String(fm.title ?? "")}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Title"
              aria-label="Title"
              className="mb-8 w-full bg-transparent font-display text-3xl font-semibold leading-tight outline-none placeholder:text-subtle sm:text-4xl"
            />
            <textarea
              ref={focusArea}
              value={body}
              onChange={(e) => onBody(e.target.value)}
              onKeyDown={onTab}
              spellCheck
              aria-label="Post body"
              className="block w-full resize-none overflow-hidden bg-transparent font-read text-[19px] leading-[1.75] outline-none"
            />
          </div>
          <div className="fixed bottom-4 right-5 font-mono text-xs text-subtle opacity-40 transition-opacity hover:opacity-100">
            {words} words · {sync === "saved" ? "saved" : sync === "saving" ? "saving…" : "unsaved"} · Esc to leave
          </div>
        </div>
      )}
      {/* Files */}
      <aside className={`flex-none border border-border lg:mr-3 ${side ? "lg:w-72" : "lg:w-11"}`}>
        {side ? (
          <div className="hidden h-full lg:block">
            <Explorer docs={docs} folders={folders} active={active} onCreate={create} error={err} />
          </div>
        ) : (
          <div className="hidden h-full flex-col items-center gap-3 py-2 lg:flex">
            <button onClick={toggleSide} title="Show files (Ctrl/⌘ + \)" aria-label="Show files" className="p-2 text-subtle hover:text-foreground">
              <PanelLeftOpen className="h-4 w-4" />
            </button>
            <span className="font-mono text-[11px] uppercase tracking-wider text-subtle [writing-mode:vertical-rl]">files · {docs.length}</span>
          </div>
        )}
        <details open={!doc} className="lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-wider text-subtle">
            <span>writings · {docs.length}</span>
            <span>{doc ? String(doc.fm.title ?? "").slice(0, 24) : "choose"} ▾</span>
          </summary>
          <div className="max-h-[70vh] border-t border-border">
            <Explorer docs={docs} folders={folders} active={active} onCreate={create} error={err} />
          </div>
        </details>
      </aside>

      {/* Workspace */}
      <section className="mt-3 flex min-h-0 min-w-0 flex-1 flex-col border border-border lg:mt-0">
        {book ? (
          <BookSettings book={book} />
        ) : !doc ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
            <p className="font-display text-2xl font-semibold">{missing ? "That file doesn't exist." : "Pick something to write."}</p>
            <p className="max-w-[44ch] text-muted-foreground">
              Choose a post or chapter on the left, or start an article, series or book with <span className="font-semibold">New</span>.
            </p>
            {err && <p className="text-sm text-red-500">{err}</p>}
          </div>
        ) : (
          <>
            {/* Top bar */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-4 py-2.5">
              <button onClick={toggleSide} title={`${side ? "Hide" : "Show"} files (Ctrl/⌘ + \\)`} aria-label={side ? "Hide files" : "Show files"} className="-ml-1 hidden p-1 text-subtle hover:text-foreground lg:block">
                {side ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </button>
              <div className="min-w-0 flex-1 truncate font-mono text-xs text-subtle">writings/{doc.slug.join("/")}</div>
              <span className={`font-mono text-xs ${syncColor}`}>{syncLabel}</span>
              <span className="font-mono text-xs text-subtle">{words} words</span>
              <span className={`border px-2 py-0.5 font-mono text-[11px] uppercase ${isDraft ? "border-brand text-brand-text" : "border-border text-subtle"}`}>{isDraft ? "draft" : "published"}</span>
              <button onClick={() => setFocusMode(true)} title="Focus mode (Ctrl/⌘ + Shift + Enter)" className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-sm hover:border-brand-text">
                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" /> Focus
              </button>
              <button onClick={() => save()} disabled={sync === "saved" || sync === "saving"} className="border border-border px-3 py-1.5 text-sm hover:border-brand-text disabled:opacity-40">
                Save draft
              </button>
              <button
                onClick={() => void publish(isDraft)}
                disabled={sync === "saving"}
                title={info.mode === "github" ? (isDraft ? "Put it live: commits to main, live in about a minute" : "Hide it from the site again") : undefined}
                className="bg-brand px-3 py-1.5 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60"
              >
                {isDraft ? "Publish" : "Unpublish"}
              </button>
            </div>
            {restored && (
              <div className="flex items-center justify-between gap-3 border-b border-border bg-muted px-4 py-2 text-sm">
                <span>Restored unsaved changes from this browser.</span>
                <button className="underline" onClick={() => { if (key) localStorage.removeItem(key); location.reload(); }}>discard</button>
              </div>
            )}
            {conflict && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted px-4 py-2 text-sm">
                <span>This was saved on another device after you opened it.</span>
                <span className="flex gap-4">
                  {conflict.theirs && (
                    <button
                      className="underline"
                      onClick={() => {
                        const t = conflict.theirs!;
                        setFm(t.fm);
                        setBody(t.body);
                        setVersion(t.version);
                        if (key) localStorage.removeItem(key);
                        setConflict(null);
                        setSync("saved");
                      }}
                    >
                      load that version
                    </button>
                  )}
                  <button className="font-semibold underline" onClick={() => void save(conflict.theirs ? conflict.theirs.version : null)}>
                    keep mine (overwrite)
                  </button>
                </span>
              </div>
            )}
            {staleLocal && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted px-4 py-2 text-sm">
                <span>This browser has unsaved edits from before a newer save elsewhere.</span>
                <span className="flex gap-4">
                  <button className="underline" onClick={() => { setFm(staleLocal.fm); setBody(staleLocal.body); setSync("dirty"); setStaleLocal(null); }}>use them</button>
                  <button className="underline" onClick={() => { if (key) localStorage.removeItem(key); setStaleLocal(null); }}>discard</button>
                </span>
              </div>
            )}
            {err && <div className="border-b border-border px-4 py-2 text-sm text-red-500">{err}</div>}

            {/* Details */}
            <details className="border-b border-border">
              <summary className="cursor-pointer px-4 py-2.5 text-sm">
                <span className="font-semibold">{String(fm.title ?? "Untitled")}</span>
                <span className="ml-3 font-mono text-xs text-subtle">details ▾</span>
              </summary>
              <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><label className={lbl} htmlFor="t">title</label><input id="t" className={field} value={String(fm.title ?? "")} onChange={(e) => setField("title", e.target.value)} /></div>
                <div className="sm:col-span-2"><label className={lbl} htmlFor="d">description (shown as the abstract and in search results)</label><textarea id="d" rows={2} className={field} value={String(fm.description ?? "")} onChange={(e) => setField("description", e.target.value)} /></div>
                <div><label className={lbl} htmlFor="dt">date</label><DateField id="dt" value={fm.date} onChange={(v) => setField("date", v)} fieldClass={field} /></div>
                <div><label className={lbl} htmlFor="tg">tags (comma separated)</label><input id="tg" className={field} defaultValue={tags} onBlur={(e) => setField("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} /></div>
              </div>
            </details>

            {/* Mobile pane switch */}
            <div className="flex border-b border-border lg:hidden" role="tablist">
              {(["write", "preview"] as const).map((p) => (
                <button key={p} role="tab" aria-selected={pane === p} onClick={() => setPane(p)} className={`flex-1 py-2.5 text-sm ${pane === p ? "border-b-2 border-brand font-semibold text-brand-text" : "text-subtle"}`}>
                  {p}
                </button>
              ))}
            </div>

            <div className="grid min-h-[70vh] flex-1 grid-cols-1 lg:min-h-0 lg:grid-cols-2">
              <div className={`${pane === "write" ? "flex" : "hidden"} min-h-0 flex-col lg:flex lg:border-r lg:border-border`}>
                <textarea
                  ref={area}
                  value={body}
                  onChange={(e) => onBody(e.target.value)}
                  onKeyDown={onTab}
                  spellCheck
                  aria-label="Post body in MDX"
                  className="min-h-[60vh] w-full flex-1 resize-none bg-background p-4 font-mono text-[14px] leading-relaxed outline-none lg:min-h-0 lg:overflow-y-auto"
                />
              </div>
              <div className={`${pane === "preview" ? "block" : "hidden"} min-h-0 overflow-y-auto bg-card/40 p-5 sm:p-8 lg:block`}>
                <div className="mb-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-subtle">
                  <span>preview · follows the site theme</span>
                  {doc && !isDraft && <Link href={`/writings/${doc.slug.join("/")}`} className="hover:text-brand-text">open live ↗</Link>}
                </div>
                <h1 className="mb-6 font-display text-3xl font-semibold leading-tight">{String(fm.title ?? "Untitled")}</h1>
                {previewErr && <pre className="mb-4 whitespace-pre-wrap border border-red-500/50 p-3 font-mono text-xs text-red-500">{previewErr}</pre>}
                <div className="prose prose-lg post post-numbered max-w-none prose-headings:font-display">{preview}</div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
    </>
  );
}
