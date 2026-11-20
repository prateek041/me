import Link from "next/link";
import { formatDate, getAllPosts, postHref, prettify, type PostMeta } from "@/lib/writings";
import { getChapterMap } from "@/lib/books";

const AREAS = [
  {
    title: "Web Development",
    text: "Full stack web applications with Go, React, Next.js and Node.js. REST and GraphQL backends on SQL and MongoDB, following a microservices architecture.",
  },
  {
    title: "Cloud Native and DevOps",
    text: "Deploying on Kubernetes and extending it as a platform. Code contributions to major open source projects like Cilium and Dapr.",
  },
  {
    title: "Content Writing",
    text: "Technical writing on this blog, on Hashnode and as a ghost writer: web development, Kubernetes, cloud native and eBPF.",
  },
];

const WORK = [
  { name: "ebpf-o11y", year: "2025", link: "https://github.com/prateek041/ebpf-o11y", text: "eBPF based auto-instrumentation of Go and Node.js applications.", short: "eBPF auto-instrumentation for Go and Node.js", stack: "Go · C · eBPF · LLVM · DWARF · Linux" },
  { name: "Senseii", year: "2024", link: "https://github.com/Senseii-ai", text: "AI driven health and fitness app.", short: "AI driven health and fitness app", stack: "Next.js · Node.js · LangChain · OpenAI · MongoDB" },
  { name: "Tetragon", year: "2023", link: "https://github.com/cilium/tetragon", text: "eBPF-based security observability and runtime enforcement.", short: "eBPF security observability, contributor", stack: "Go · eBPF · Kubernetes · Helm · CI/CD" },
  { name: "Dapr", year: "2023", link: "https://github.com/dapr/dapr", text: "A portable, event-driven runtime for building distributed applications across cloud and edge.", short: "distributed application runtime, contributor", stack: "Go · Docker · Pub/Sub · Prometheus" },
];

const LOOKING = ["Developer Relations", "eBPF, Observability and Kernel Engineering", "AI powered product development"];

const LINKS = {
  github: "https://github.com/prateek041",
  x: "https://x.com/prateek_0041",
  linkedin: "https://www.linkedin.com/in/prateek-singh-903449211/",
  mail: "mailto:prateeksingh9741@gmail.com",
};

const years = new Date().getFullYear() - 2022;

function meta(p: PostMeta) {
  const ch = getChapterMap().get(p.slug.join("/"));
  const series = ch ? ` · ${ch.book.toLowerCase()} · ch. ${ch.n}` : p.slug.length > 2 ? ` · ${prettify(p.slug[1]).toLowerCase()}` : "";
  return `${p.section}${series} · ${p.readMinutes} min`;
}

const wrap = "mx-auto w-full max-w-6xl px-5 sm:px-8";
const section = "border-t border-border py-12 md:py-[72px]";
const h2 = "font-display text-3xl font-semibold tracking-[-0.02em] md:text-[40px]";

function DefaultHome({ posts, total }: { posts: PostMeta[]; total: number }) {
  return (
    <main className={wrap}>
      <section className="flex flex-col gap-6 py-14 md:gap-8 md:py-28">
        <div className="font-mono text-sm text-subtle">~/prateek · software engineer · india</div>
        <h1 className="max-w-[16ch] font-display text-5xl font-semibold leading-[0.98] tracking-[-0.035em] sm:text-7xl lg:text-[96px]">
          Building at the edge of the kernel and the product.
        </h1>
        <p className="max-w-[58ch] text-lg leading-[1.55] text-muted-foreground md:text-xl">
          Software engineer working with <span className="text-foreground">open source</span>,{" "}
          <span className="text-foreground">full stack product development</span> and{" "}
          <span className="text-foreground">artificial intelligence</span>. About {years} years across web
          technologies, cloud native, eBPF and writing.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href="/writings" className="inline-flex min-h-12 items-center gap-2.5 bg-brand px-5 text-[15px] font-semibold text-brand-foreground hover:opacity-90">
            Read the writings <span aria-hidden="true">→</span>
          </Link>
          <a href="#contact" className="inline-flex min-h-12 items-center border border-border px-5 text-[15px] font-medium hover:border-brand-text">
            Get in touch
          </a>
        </div>
      </section>

      <section aria-labelledby="help" className={`${section} flex flex-col gap-8 md:gap-10`}>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="help" className={h2}>I can help you with</h2>
          <span className="font-mono text-[13px] text-subtle">03 areas</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {AREAS.map((a, i) => (
            <article key={a.title} className="flex flex-col gap-3.5 border border-border bg-card p-6 md:p-7">
              <div className="font-mono text-[13px] text-brand-text">0{i + 1}</div>
              <h3 className="font-display text-2xl font-semibold">{a.title}</h3>
              <p className="text-[15px] text-muted-foreground">{a.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="work" className={`${section} flex flex-col`}>
        <h2 id="work" className={`${h2} mb-6 md:mb-8`}>Work</h2>
        {WORK.map((w) => (
          <a key={w.name} href={w.link} className="flex flex-wrap gap-x-8 gap-y-2 border-b border-border py-6 hover:text-brand-text">
            <div className="w-16 flex-none font-mono text-sm text-subtle">/{w.year.slice(2)}</div>
            <div className="flex min-w-0 flex-[999_1_320px] flex-col gap-1.5">
              <div className="font-display text-[26px] font-semibold tracking-tight md:text-[28px]">{w.name}</div>
              <div className="text-muted-foreground">{w.text}</div>
            </div>
            <div className="flex-[1_1_260px] font-mono text-[13px] leading-[1.7] text-subtle">{w.stack}</div>
          </a>
        ))}
      </section>

      <section aria-labelledby="latest" className={`${section} flex flex-col gap-8`}>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="latest" className={h2}>Latest writing</h2>
          <Link href="/writings" className="font-mono text-sm text-muted-foreground hover:text-foreground">
            all {total} posts →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug.join("/")} href={postHref(p)} className="flex min-h-[220px] flex-col gap-3 border border-border p-6 hover:border-brand-text md:p-7">
              <div className="font-mono text-[13px] text-subtle">{meta(p)}</div>
              <div className="font-display text-2xl font-semibold leading-[1.15] md:text-[26px]">{p.title}</div>
              {p.description && <div className="line-clamp-3 text-[15px] text-muted-foreground">{p.description}</div>}
              <div className="mt-auto font-mono text-[13px] text-subtle">{formatDate(p.date, "short")}</div>
            </Link>
          ))}
        </div>
      </section>

      <section id="contact" aria-labelledby="next" className={`${section} flex flex-wrap gap-x-16 gap-y-12 md:pb-[120px]`}>
        <div className="flex flex-[1_1_380px] flex-col gap-5">
          <div className="font-mono text-[13px] text-subtle">looking forward to work with</div>
          <ul className="flex flex-col gap-2.5 font-display text-2xl font-medium leading-tight md:text-[26px]">
            {LOOKING.map((l) => <li key={l}>{l}</li>)}
          </ul>
        </div>
        <div className="flex flex-[1_1_380px] flex-col gap-6 border border-brand p-6 md:p-8">
          <h2 id="next" className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.01em] md:text-[32px]">
            Let’s talk about a project, collaboration or an idea you may have.
          </h2>
          <div className="flex flex-wrap gap-3">
            <a href={LINKS.mail} className="inline-flex min-h-12 items-center bg-brand px-5 text-[15px] font-semibold text-brand-foreground hover:opacity-90">Connect with me</a>
            <a href={LINKS.linkedin} className="inline-flex min-h-12 items-center border border-border px-4 text-[15px] hover:border-brand-text">LinkedIn</a>
            <a href={LINKS.x} className="inline-flex min-h-12 items-center border border-border px-4 text-[15px] hover:border-brand-text">X</a>
          </div>
        </div>
      </section>
    </main>
  );
}

const label = "mb-3.5 text-base font-normal tracking-[0.08em] text-subtle [font-variant:small-caps]";
const row = "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5";
const plink = "text-brand-text";

function PaperHome({ posts, total }: { posts: PostMeta[]; total: number }) {
  return (
    <main className="mx-auto w-full max-w-[640px] px-5 pb-20 pt-16 sm:px-8 md:pt-32">
      <section className="flex flex-col gap-5">
        <h1 className="text-[40px] font-semibold leading-[1.08] tracking-[-0.01em] sm:text-[52px]">Prateek Singh</h1>
        <p className="text-[23px] italic leading-[1.45]">Software engineer, building at the edge of the kernel and the product.</p>
        <p className="text-muted-foreground">
          I work with open source, full stack product development and artificial intelligence. About {years} years
          across web technologies, cloud native, eBPF and writing. Based in India.
        </p>
        <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
          <Link href="/writings" className={plink}>Writings</Link>
          <a href={LINKS.github} className={plink}>GitHub</a>
          <a href={LINKS.x} className={plink}>X</a>
          <a href={LINKS.linkedin} className={plink}>LinkedIn</a>
        </div>
      </section>

      <section aria-labelledby="p-work" className="mt-24">
        <h2 id="p-work" className={label}>work</h2>
        <ul className="flex flex-col gap-3">
          {WORK.map((w) => (
            <li key={w.name} className={row}>
              <span><a href={w.link} className={plink}>{w.name}</a> <span className="text-subtle">· {w.short}</span></span>
              <span className="text-base text-subtle">{w.year}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="p-writing" className="mt-16">
        <h2 id="p-writing" className={label}>writing</h2>
        <ul className="flex flex-col gap-3">
          {posts.map((p) => (
            <li key={p.slug.join("/")} className={row}>
              <Link href={postHref(p)} className={plink}>{p.title}</Link>
              <span className="text-base text-subtle">{formatDate(p.date, "month")}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4"><Link href="/writings" className="italic text-subtle">All {total} entries →</Link></div>
      </section>

      <section id="p-contact" aria-labelledby="p-open" className="mt-16">
        <h2 id="p-open" className={label}>open to</h2>
        <p>
          Developer relations, eBPF, observability and kernel engineering, and AI powered product development.
          Let’s talk about a project, collaboration or an idea you may have. <a href={LINKS.mail} className={plink}>Say hello</a>.
        </p>
      </section>
    </main>
  );
}

export default function Home() {
  const all = getAllPosts().filter((p) => !p.draft);
  const posts = all.slice(0, 3);
  return (
    <>
      <div className="paper:hidden"><DefaultHome posts={posts} total={all.length} /></div>
      <div className="hidden paper:block"><PaperHome posts={posts} total={all.length} /></div>
    </>
  );
}
