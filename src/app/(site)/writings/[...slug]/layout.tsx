import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writings",
  description: "All that I have written",
};

export default function WritingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
