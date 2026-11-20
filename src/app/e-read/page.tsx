import type { Metadata } from "next";
import { formatDate, getAllPosts, instapaperHref, postHref, prettify, READER_URL, type PostMeta } from "@/lib/writings";

export const metadata: Metadata = {
  title: "Prateek Singh: Writings, e-reader edition",
  description: "Every article by Prateek Singh in plain HTML, for e-readers and Instapaper.",
};

const SECTIONS = ["tech", "thoughts", "life"];

function Entry({ p }: { p: PostMeta }) {
  const series = p.slug.length > 2 ? `${prettify(p.slug[1])}: ` : "";
  return (
    <li>
      <a href={postHref(p)}>{series}{p.title}</a>
      <small>
        {formatDate(p.date)} · {p.readMinutes} min · <a href={instapaperHref(READER_URL + postHref(p))}>Save to Instapaper</a>
      </small>
    </li>
  );
}

export default function ReaderIndex() {
  const posts = getAllPosts().filter((p) => !p.draft);
  return (
    <main>
      <h1>Prateek Singh: Writings</h1>
      <p>
        The e-reader edition: every article as plain, readable text. Open one here, or save it to Instapaper. The full site is
        at <a href="https://prateeksingh.life">prateeksingh.life</a>.
      </p>
      {SECTIONS.map((s) => {
        const list = posts.filter((p) => p.section === s);
        if (!list.length) return null;
        return (
          <section key={s}>
            <h2>{s[0].toUpperCase() + s.slice(1)}</h2>
            <ul className="entries">{list.map((p) => <Entry key={p.slug.join("/")} p={p} />)}</ul>
          </section>
        );
      })}
    </main>
  );
}
