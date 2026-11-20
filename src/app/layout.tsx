import type { Metadata } from "next";
import "./globals.css";
import {
  Inter,
  JetBrains_Mono,
  Source_Serif_4,
  Space_Grotesk,
  STIX_Two_Text,
} from "next/font/google";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });
const jbm = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbm", display: "swap" });
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
  display: "swap",
});
const stix = STIX_Two_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-stix",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prateek Singh",
  description: "Software engineer working with open source, full stack product development and AI.",
  alternates: { types: { "application/rss+xml": "/writings/rss.xml" } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${space.variable} ${jbm.variable} ${sourceSerif.variable} ${stix.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        {/* Themes: dark (default), light and paper. Applied as a class on <html>. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          themes={["dark", "light", "paper", "paper-dark"]}
          enableSystem={false}
          // color-scheme comes from globals.css per theme; next-themes would force "dark" on paper.
          enableColorScheme={false}
          disableTransitionOnChange
        >
          <SiteNav />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
