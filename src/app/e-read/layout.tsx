import type { Metadata } from "next";
import "./reader.css";

// Reader pages copy the articles on the main site, so search engines should only index the originals.
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function ReaderLayout({ children }: { children: React.ReactNode }) {
  return <div className="reader">{children}</div>;
}
