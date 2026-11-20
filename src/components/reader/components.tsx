import type { MDXComponents } from "mdx/types";
import type { ComponentProps, ReactNode } from "react";

/*
 * MDX components for the e-reader / Instapaper edition: plain semantic HTML
 * with no interface around the text. No copy buttons, no "#" heading links,
 * no icons, no client JavaScript. Instapaper keeps <figure>, <figcaption>,
 * <blockquote>, <pre> and <table>, so everything maps onto those.
 */

const LABEL = { note: "Note", tip: "Tip", warning: "Warning" } as const;

function Callout({ type = "note", title, children }: { type?: keyof typeof LABEL; title?: string; children: ReactNode }) {
  return (
    <blockquote>
      <p>
        <strong>{title ?? LABEL[type]}.</strong>
      </p>
      {children}
    </blockquote>
  );
}

function Figure({ src, alt = "", caption }: { src: string; alt?: string; caption?: ReactNode }) {
  return (
    <figure>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export const readerComponents: MDXComponents = {
  Callout,
  Figure,
  a: ({ href = "", ...props }: ComponentProps<"a">) => <a href={href} {...props} />,
  h2: ({ id, children }: ComponentProps<"h2">) => <h2 id={id}>{children}</h2>,
  h3: ({ id, children }: ComponentProps<"h3">) => <h3 id={id}>{children}</h3>,
  code: (props: ComponentProps<"code">) => <code {...props} />,
  pre: (props: ComponentProps<"pre">) => <pre {...props} />,
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ alt = "", ...props }: ComponentProps<"img">) => <img alt={alt} {...props} />,
  table: (props: ComponentProps<"table">) => <table {...props} />,
};
