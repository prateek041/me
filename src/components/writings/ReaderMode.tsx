"use client";

import { useEffect, useState } from "react";
import { BookOpen, X } from "lucide-react";

/**
 * Focused reading: hides everything except the article (nav, footer, breadcrumbs,
 * series and contents lists, author card, prev/next, more posts). Elements that
 * should disappear carry `data-chrome`; the `reading` class on <html> hides them.
 * Esc or the button leaves. Not remembered across pages.
 */
export default function ReaderMode() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("reading", on);
    if (!on) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOn(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on]);
  useEffect(() => () => document.documentElement.classList.remove("reading"), []);

  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      title={on ? "Leave focused reading (Esc)" : "Focused reading: hide everything but the article"}
      className={`fixed bottom-5 right-5 z-40 inline-flex min-h-11 items-center gap-2 border border-border bg-background/90 px-3.5 font-mono text-[13px] text-muted-foreground backdrop-blur hover:border-brand-text hover:text-foreground paper:font-sans paper:text-base paper:[font-variant:small-caps] ${
        on ? "opacity-40 transition-opacity hover:opacity-100 focus-visible:opacity-100" : ""
      }`}
    >
      {on ? <X className="h-4 w-4" aria-hidden="true" /> : <BookOpen className="h-4 w-4" aria-hidden="true" />}
      {on ? "Exit focus" : "Focus"}
    </button>
  );
}
