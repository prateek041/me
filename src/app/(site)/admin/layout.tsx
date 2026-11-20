import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth, canEdit, isLocalDev } from "@/auth";

export const metadata: Metadata = { title: "Editor", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Local dev: open. Deployed: Google sign-in as the site owner; everyone else gets a 404. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (await canEdit()) return children;
  if (!isLocalDev() && process.env.ADMIN_EMAIL && process.env.AUTH_SECRET && !(await auth())) redirect("/login");
  notFound();
}
