import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import { ThemeProvider } from "@/components/ThemeProvider";

/** The main site: themes, nav and footer. The e-reader edition (app/e-read) has none of these. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    // Themes: dark (default), light, paper and paper-dark. Applied as a class on <html>.
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      themes={["dark", "light", "paper", "paper-dark"]}
      enableSystem={false}
      // color-scheme comes from globals.css per theme; next-themes would force "dark" on paper.
      enableColorScheme={false}
      disableTransitionOnChange
    >
      <div className="flex min-h-screen flex-col">
        <SiteNav />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </div>
    </ThemeProvider>
  );
}
