import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editor", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Local only: hidden in production builds and on any non-localhost host (e.g. a tunnel).
  const host = (headers().get("host") ?? "").split(":")[0];
  if (process.env.NODE_ENV === "production" || (host !== "localhost" && host !== "127.0.0.1")) notFound();
  return children;
}
