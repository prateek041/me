import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { canEdit, signIn } from "@/auth";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  if (await canEdit()) redirect("/admin");
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 py-24 text-center sm:px-8">
      <h1 className="font-display text-3xl font-semibold">Editor sign in</h1>
      <p className="text-muted-foreground">Only the site owner can sign in.</p>
      {searchParams.error && <p className="text-sm text-red-500">That account can&apos;t edit this site.</p>}
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/admin" });
        }}
      >
        <button className="inline-flex min-h-12 w-full items-center justify-center bg-brand px-5 text-[15px] font-semibold text-brand-foreground hover:opacity-90">
          Continue with Google
        </button>
      </form>
    </main>
  );
}
