"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, ChevronDown, FileText, Moon, Sun } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useTheme } from "next-themes";

const OPTIONS = [
  { id: "dark", label: "Dark", hint: "navy, the default", icon: Moon },
  { id: "light", label: "Light", hint: "warm cream", icon: Sun },
  { id: "paper", label: "Paper", hint: "reads like a research paper", icon: FileText },
  { id: "paper-dark", label: "Paper dark", hint: "the research paper, at night", icon: FileText },
] as const;

/** A dropdown picker: the button shows the current theme, the menu lists all three. */
function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = OPTIONS.find((o) => o.id === (mounted ? theme : "dark")) ?? OPTIONS[0];
  const Icon = current.icon;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={`Theme: ${current.label}. Change theme`}
        className="inline-flex min-h-11 items-center gap-2 border border-border px-2.5 font-mono text-[13px] text-muted-foreground hover:border-brand-text hover:text-foreground data-[state=open]:border-brand-text paper:border-0 paper:px-0 paper:font-sans paper:text-[17px] paper:[font-variant:small-caps]"
      >
        <Icon className="hidden h-4 w-4 sm:block paper:hidden" aria-hidden="true" />
        <span className="hidden text-subtle sm:inline paper:inline paper:italic">Theme:</span>
        <span className="whitespace-nowrap text-foreground">{current.label}</span>
        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 w-60 border border-border bg-background p-1 text-foreground shadow-lg paper:font-sans"
        >
          <DropdownMenu.RadioGroup value={current.id} onValueChange={(v) => setTheme(v)}>
            {OPTIONS.map((o) => (
              <DropdownMenu.RadioItem
                key={o.id}
                value={o.id}
                className="flex cursor-pointer items-center gap-3 px-3 py-2.5 outline-none data-[highlighted]:bg-muted data-[state=checked]:text-brand-text"
              >
                <o.icon className="h-4 w-4 flex-none" aria-hidden="true" />
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">{o.label}</span>
                  <span className="text-xs text-muted-foreground">{o.hint}</span>
                </span>
                <DropdownMenu.ItemIndicator className="ml-auto">
                  <Check className="h-4 w-4" aria-hidden="true" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
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
        className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-3 px-5 py-2 sm:gap-x-4 sm:px-8 paper:max-w-3xl paper:items-baseline"
      >
        <Link href="/" className="font-display text-xl font-semibold tracking-tight paper:text-lg">
          Prateek Singh
        </Link>
        <div className="flex items-center gap-3.5 font-mono text-sm sm:gap-7 paper:gap-5 paper:font-sans paper:text-[17px] paper:tracking-wide paper:[font-variant:small-caps]">
          <Link href="/" className={link(path === "/")}>Home</Link>
          <Link href="/writings" className={link(path.startsWith("/writings"))}>Writings</Link>
          <a href="https://github.com/prateek041" className={`${link(false)} hidden sm:inline-flex paper:hidden`}>
            GitHub
          </a>
          <a href="/writings/rss.xml" className={`${link(false)} hidden paper:inline-flex`}>RSS</a>
        </div>
        <ThemeSwitcher />
      </nav>
    </header>
  );
}
