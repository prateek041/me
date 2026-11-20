import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { headers } from "next/headers";

/*
 * Sign-in for the online editor. Google only, and only the address in
 * ADMIN_EMAIL gets in (kept in the environment, not in this public code).
 * Needs AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET and ADMIN_EMAIL.
 */
const admin = () => process.env.ADMIN_EMAIL?.trim().toLowerCase();

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      return !!email && !!admin() && email === admin() && profile?.email_verified === true;
    },
  },
});

/** True on `next dev` from this machine, where the editor works on local files with no login. */
export function isLocalDev(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const host = (headers().get("host") ?? "").split(":")[0];
  return host === "localhost" || host === "127.0.0.1";
}

/** Who may use the editor: local dev, or a signed-in session for ADMIN_EMAIL. */
export async function canEdit(): Promise<boolean> {
  if (isLocalDev()) return true;
  if (!admin() || !process.env.AUTH_SECRET) return false;
  const session = await auth();
  return session?.user?.email?.toLowerCase() === admin();
}
