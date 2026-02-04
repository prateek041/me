import { redirect } from "next/navigation";
import readDirectoryRecursively from "./api/blog";
import { getLatestArticleSlugPerSection } from "./api/tree";

const DEFAULT_SECTION = "life";

export default function WritingsPage() {
  const fullTree = readDirectoryRecursively(process.cwd() + "/writings");
  const sectionLatestMap = getLatestArticleSlugPerSection(fullTree);
  const defaultSlug =
    sectionLatestMap[DEFAULT_SECTION] ??
    Object.values(sectionLatestMap)[0];
  if (!defaultSlug || defaultSlug.length === 0) {
    redirect("/");
  }
  redirect(`/writings/${defaultSlug.join("/")}`);
}
