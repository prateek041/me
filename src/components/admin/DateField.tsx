"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** YYYY-MM-DD for the local calendar day of `d`. Never use toISOString() here: that is the UTC day. */
export const localYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function ymdIfReal(y: number, m: number, d: number): string | null {
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null; // e.g. 2026-02-31
  return `${y}-${pad(m)}-${pad(d)}`;
}

/**
 * Reads a frontmatter date as a YYYY-MM-DD calendar day, or null if it can't.
 * - "2026-11-20" (and ISO strings with a time after it) -> the day as written, no timezone shift.
 * - Date objects -> their UTC day (YAML parses `date: 2026-11-20` as UTC midnight).
 * - Anything else JS can read that names a 4-digit year ("November 20, 2026") -> its local day,
 *   since JS parses those as local midnight.
 */
export function toYMD(v: unknown): string | null {
  if (v instanceof Date) {
    return Number.isNaN(v.getTime()) ? null : `${v.getUTCFullYear()}-${pad(v.getUTCMonth() + 1)}-${pad(v.getUTCDate())}`;
  }
  if (typeof v !== "string") return null;
  const s = v.trim();
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?=$|[T\s])/);
  if (iso) return ymdIfReal(+iso[1], +iso[2], +iso[3]);
  if (!/\b\d{4}\b/.test(s)) return null; // new Date("12") is 2001-12-01; don't guess
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : localYMD(d);
}

/**
 * Native date picker for a frontmatter date. Shows whatever is stored, and writes YYYY-MM-DD only
 * when the author picks a day. Clearing the picker never clears the stored date (it is required).
 */
export default function DateField({
  id,
  value,
  onChange,
  fieldClass,
}: {
  id: string;
  value: unknown;
  onChange: (ymd: string) => void;
  fieldClass: string;
}) {
  const ymd = toYMD(value);
  const raw = value == null ? "" : value instanceof Date ? (ymd ?? "") : String(value);
  // Local text so a cleared or half-typed picker isn't snapped back by React on every keystroke.
  const [text, setText] = useState(ymd ?? "");
  useEffect(() => setText(ymd ?? ""), [ymd]);

  const pick = (v: string) => {
    setText(v);
    if (v) onChange(v);
  };

  let note: string | null = null;
  if (!raw) note = "A post needs a date.";
  else if (!ymd) note = `Saved as “${raw}”, which isn’t a date the picker can read. Pick one to replace it.`;
  else if (!text) note = `A date is required. “${raw}” is kept until you pick another.`;
  else if (raw !== ymd) note = `Saved as “${raw}”. Picking a date saves it as YYYY-MM-DD.`;
  const noteId = `${id}-note`;

  return (
    <>
      <div className="flex gap-2">
        <input
          id={id}
          type="date"
          value={text}
          onChange={(e) => pick(e.target.value)}
          aria-describedby={note ? noteId : undefined}
          aria-invalid={!ymd || undefined}
          className={`${fieldClass} min-h-[38px] min-w-0 flex-1 appearance-none font-mono accent-brand [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-date-and-time-value]:text-left`}
        />
        <button
          type="button"
          onClick={() => pick(localYMD(new Date()))}
          className="flex-none border border-border px-3 text-sm hover:border-brand-text focus-visible:border-brand-text focus-visible:outline-none"
        >
          Today
        </button>
      </div>
      {note && (
        <p id={noteId} className={`mt-1 text-xs ${ymd ? "text-subtle" : "text-brand-text"}`}>
          {note}
        </p>
      )}
    </>
  );
}
