export default function SiteFooter() {
  return (
    <footer data-chrome className="border-t border-border paper:border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6 font-mono text-[13px] text-subtle sm:px-8 paper:max-w-3xl paper:font-sans paper:text-base">
        <span>© {new Date().getFullYear()} Prateek Singh</span>
        <span className="flex gap-6">
          <a href="/writings/rss.xml" className="hover:text-foreground">RSS</a>
          <a href="https://github.com/prateek041" className="hover:text-foreground">GitHub</a>
          <a href="https://x.com/prateek_0041" className="hover:text-foreground">X</a>
        </span>
      </div>
    </footer>
  );
}
