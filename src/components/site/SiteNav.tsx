"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const ORDER = ["dark", "light", "paper"] as const;
type Theme = (typeof ORDER)[number];
const ICON = { dark: Moon, light: Sun, paper: FileText } as const;

/** Three visible options: dark, light and paper. */
function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = mounted ? theme : undefined;

  return (
    <div className="flex w-full items-center gap-3 sm:w-auto paper:gap-3">
      <span className="font-mono text-[13px] text-subtle paper:font-sans paper:text-base paper:italic">theme:</span>
      <div role="group" aria-label="Theme" className="flex items-center border border-border paper:gap-3 paper:border-0">
      {ORDER.map((t) => {
        const Icon = ICON[t];
        const active = current === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => setTheme(t)}
            aria-pressed={active}
            aria-label={`${t} theme`}
            title={`${t} theme`}
            className={`inline-flex h-11 items-center justify-center gap-1.5 px-3 font-mono text-[13px] paper:font-sans paper:min-w-0 paper:px-0 paper:text-[17px] paper:[font-variant:small-caps] ${
              active ? "bg-brand text-brand-foreground paper:bg-transparent paper:font-bold paper:text-foreground paper:underline" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="hidden h-4 w-4 sm:block paper:hidden" aria-hidden="true" />
            <span>{t}</span>
          </button>
        );
      })}
      </div>
    </div>
  );
}

export default function SiteNav() {
  const path = usePathname();
  const link = (active: boolean) =>
    `inline-flex min-h-11 items-center ${active ? "text-foreground" : "text-muted-foreground"} hover:text-foreground`;

  return (
    <header className="border-b border-border paper:border-0">
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 px-5 py-2 sm:px-8 paper:max-w-3xl paper:items-baseline"
      >
        <Link href="/" className="font-display text-xl font-semibold tracking-tight paper:text-lg">
          Prateek Singh
        </Link>
        <div className="flex items-center gap-3.5 font-mono text-sm sm:gap-7 paper:gap-5 paper:font-sans paper:text-[17px] paper:tracking-wide paper:[font-variant:small-caps]">
          <Link href="/" className={link(path === "/")}>home</Link>
          <Link href="/writings" className={link(path.startsWith("/writings"))}>writings</Link>
          <a href="https://github.com/prateek041" className={`${link(false)} hidden sm:inline-flex paper:hidden`}>
            github
          </a>
          <a href="/writings/rss.xml" className={`${link(false)} hidden paper:inline-flex`}>rss</a>
        </div>
        <ThemeSwitcher />
      </nav>
    </header>
  );
}
