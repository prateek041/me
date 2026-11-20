import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import remarkEmoji from "remark-emoji";
import remarkFrontmatter from "remark-frontmatter";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import remarkCallouts from "./src/lib/remark-callouts.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {};

// Posts in /writings are compiled to React components at build time.
// `.md` files are read as plain Markdown, so older posts work unchanged.
// `.mdx` files can also use the components from src/mdx-components.tsx.
// Frontmatter is stripped here and read separately by src/lib/writings.ts.
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkFrontmatter, remarkGfm, remarkEmoji, remarkCallouts],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          // Both themes are rendered; globals.css picks one based on the .dark class.
          theme: { light: "github-light", dark: "github-dark" },
          keepBackground: false,
          defaultLang: { block: "plaintext" },
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
