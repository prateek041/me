import type { FileSystemNode } from "./blog";

/**
 * Resolve a slug (e.g. ["tech", "ebpf", "introduction-to-ebpf"]) to the node in the tree.
 * Returns the node if it exists and is a .md file, or the directory node if it's a directory; null if not found.
 */
export function getNodeBySlug(
  rootNodes: FileSystemNode[],
  slug: string[]
): FileSystemNode | null {
  if (slug.length === 0) return null;
  let current: FileSystemNode[] = rootNodes;
  let node: FileSystemNode | null = null;
  for (let i = 0; i < slug.length; i++) {
    const segment = slug[i];
    const isLast = i === slug.length - 1;
    const next = current.find(
      (n) =>
        n.name === segment ||
        (isLast && n.name === `${segment}.md`)
    );
    if (!next) return null;
    node = next;
    if (!next.children) break;
    current = next.children;
  }
  return node;
}

/** Derive slug from a file node: articlePath "writings/tech/ebpf/elf.md" -> ["tech", "ebpf", "elf"] */
export function getSlugFromNode(node: FileSystemNode): string[] {
  const withoutExt = node.articlePath.replace(/\.md$/, "");
  const relative = withoutExt.startsWith("writings/")
    ? withoutExt.slice("writings/".length)
    : withoutExt;
  return relative ? relative.split("/") : [];
}

/** Collect all .md file nodes under a node (recursive). */
function collectMarkdownFiles(node: FileSystemNode): FileSystemNode[] {
  if (!node.isDirectory && node.name.endsWith(".md")) {
    return [node];
  }
  if (!node.children) return [];
  return node.children.flatMap(collectMarkdownFiles);
}

/**
 * Navigate from rootNodes by pathPrefix, then return the slug of the latest
 * article (by lastModified) under that path, or null if none.
 */
export function getLatestArticleUnderPath(
  rootNodes: FileSystemNode[],
  pathPrefix: string[]
): string[] | null {
  let current: FileSystemNode[] = rootNodes;
  let targetNode: FileSystemNode | null = null;
  for (const segment of pathPrefix) {
    const next = current.find((n) => n.name === segment);
    if (!next) return null;
    targetNode = next;
    if (!next.children) return null;
    current = next.children;
  }
  if (!targetNode) return null;
  const files = collectMarkdownFiles(targetNode);
  if (files.length === 0) return null;
  const sorted = [...files].sort(
    (a, b) =>
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );
  return getSlugFromNode(sorted[0]);
}

/**
 * For each top-level section (tech, life, thoughts), return the slug of the
 * latest article in that section. Only includes sections that have at least one article.
 */
export function getLatestArticleSlugPerSection(
  rootNodes: FileSystemNode[]
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  const sectionOrder = ["tech", "thoughts", "life"];
  for (const node of rootNodes) {
    if (!node.isDirectory) continue;
    const slug = getLatestArticleUnderPath(rootNodes, [node.name]);
    if (slug) result[node.name] = slug;
  }
  // Return in stable order: tech, thoughts, life
  const ordered: Record<string, string[]> = {};
  for (const key of sectionOrder) {
    if (result[key]) ordered[key] = result[key];
  }
  for (const key of Object.keys(result)) {
    if (!ordered[key]) ordered[key] = result[key];
  }
  return ordered;
}
