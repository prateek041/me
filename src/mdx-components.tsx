import type { MDXComponents } from "mdx/types";
import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { Info, Lightbulb, TriangleAlert } from "lucide-react";
import CodeBlock from "@/components/writings/CodeBlock";

// Posts are plain Markdown. Each element below maps to the site's look,
// so every post is styled the same way with no per-post CSS.
// Base typography comes from the `prose` wrapper in the post page;
// these override the parts that need behaviour or a different look.

const CALLOUTS = {
  note: { icon: Info, label: "Note", cls: "border-sky-500/40 bg-sky-500/5" },
  tip: { icon: Lightbulb, label: "Tip", cls: "border-emerald-500/40 bg-emerald-500/5" },
  warning: { icon: TriangleAlert, label: "Warning", cls: "border-amber-500/50 bg-amber-500/5" },
} as const;

/** `<Callout type="tip" title="...">…</Callout>` in an .mdx post. */
export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: keyof typeof CALLOUTS;
  title?: string;
  children: ReactNode;
}) {
  const { icon: Icon, label, cls } = CALLOUTS[type];
  return (
    <div className={`not-prose my-6 rounded-lg border px-4 py-3 ${cls}`}>
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4" />
        {title ?? label}
      </div>
      <div className="text-[0.95em] leading-relaxed text-foreground/90 [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&>p+p]:mt-3">
        {children}
      </div>
    </div>
  );
}

/** `<Figure src="..." caption="..." />` — an image with a caption. */
export function Figure({ src, alt = "", caption }: { src: string; alt?: string; caption?: ReactNode }) {
  return (
    <figure className="my-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className="mx-auto rounded-lg border" />
      {caption && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

function Anchor({ href = "", children, ...props }: ComponentProps<"a">) {
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

/** h2/h3 get a "#" link that appears on hover, for sharing a section. */
function headingWithAnchor(Tag: "h2" | "h3") {
  return function Heading({ id, children, ...props }: ComponentProps<"h2">) {
    return (
      <Tag id={id} {...props} className="group scroll-mt-24">
        {children}
        {id && (
          <a
            href={`#${id}`}
            aria-label="Link to this section"
            className="ml-2 font-normal text-muted-foreground no-underline opacity-0 transition-opacity group-hover:opacity-100"
          >
            #
          </a>
        )}
      </Tag>
    );
  };
}

export const components: MDXComponents = {
  Callout,
  Figure,
  a: Anchor,
  h2: headingWithAnchor("h2"),
  h3: headingWithAnchor("h3"),
  // Fenced code is highlighted at build time by rehype-pretty-code; it marks
  // block code with data-language, so plain inline `code` is styled here.
  code: ({ className = "", ...props }) =>
    "data-language" in props ? (
      <code className={className} {...props} />
    ) : (
      <code className={`rounded-md bg-muted px-1.5 py-0.5 font-normal ${className}`} {...props} />
    ),
  pre: (props) => <CodeBlock {...props} />,
  img: ({ alt = "", ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} loading="lazy" {...props} className="mx-auto rounded-lg border" />
  ),
  table: (props) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
};

export function useMDXComponents(inherited: MDXComponents = {}): MDXComponents {
  return { ...inherited, ...components };
}
