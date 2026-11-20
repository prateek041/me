import { NextResponse, type NextRequest } from "next/server";

/**
 * e-read.prateeksingh.life serves the e-reader / Instapaper edition from app/e-read.
 * Both /writings/tech/x and /tech/x map to /e-read/tech/x, so swapping the host on
 * any article link just works. Files (images, rss.xml, robots.txt) are served as-is.
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  if (!host.startsWith("e-read.")) return NextResponse.next();
  const url = req.nextUrl.clone();
  const path = url.pathname.replace(/^\/writings(?=\/|$)/, "").replace(/^\/e-read(?=\/|$)/, "");
  url.pathname = "/e-read" + (path === "/" ? "" : path);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/|.*\\.[A-Za-z0-9]+$).*)"],
};
