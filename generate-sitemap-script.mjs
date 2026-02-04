// generate-sitemap-content.mjs (or .js) - With copied function

import fs from 'fs'; // Use import for fs
import path from 'path'; // Use import for path
import matter from 'gray-matter'; // Use import for gray-matter

const SITE_URL = "https://prateeksingh.xyz";

// --- Copied and adapted from your blog.ts ---
// Make sure FileSystemNode interface/type is defined or not strictly needed for this script's logic
// For the script, we mainly care about the properties used: path, isDirectory, children, lastModified

// Minimal FileSystemNode structure needed for this script
// interface FileSystemNode {
//   path: string;
//   isDirectory: boolean;
//   lastModified: string | null; // Assuming it can be null from getFileDate
//   children?: FileSystemNode[];
// }

const getFileDate = (filePath, isDirectory) => { // Parameters simplified for this context
  if (isDirectory) {
    return null;
  }
  try {
    const fileData = fs.readFileSync(filePath, 'utf-8'); // Added 'utf-8'
    const matterResult = matter(fileData);
    return matterResult.data.date || null; // Ensure it returns null if no date
  } catch (e) {
    // console.error(`Error reading file for date: ${filePath}`, e);
    return null;
  }
};

const readDirectoryRecursively = (
  dirPath,
  parentPath = null, // parentPath not really used in sitemap logic
) => {
  try {
    const files = fs.readdirSync(dirPath);

    return files.map((file) => {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      const isDirectory = stat.isDirectory();

      const node = { // Simplified node structure for the script
        path: fullPath,
        isDirectory: isDirectory,
        lastModified: getFileDate(fullPath, isDirectory),
        children: isDirectory
          ? readDirectoryRecursively(fullPath, fullPath)
          : undefined,
      };
      return node;
    });
  } catch (e) {
    // console.error(`Error reading directory: ${dirPath}`, e);
    return []; // Return empty array on error
  }
};
// --- End of Copied Function ---


function generateSitemapContent() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  xml += `    <url>\n`;
  xml += `        <loc>${SITE_URL}/</loc>\n`;
  xml += `        <lastmod>${new Date().toISOString()}</lastmod>\n`;
  xml += `        <changefreq>monthly</changefreq>\n`;
  xml += `        <priority>1.0</priority>\n`;
  xml += `    </url>\n`;
  xml += `    <url>\n`;
  xml += `        <loc>${SITE_URL}/writings</loc>\n`;
  xml += `        <lastmod>${new Date().toISOString()}</lastmod>\n`;
  xml += `        <changefreq>weekly</changefreq>\n`;
  xml += `        <priority>0.9</priority>\n`;
  xml += `    </url>\n`;

  const writingsBaseDir = path.join(process.cwd(), "writings");
  const allNodes = readDirectoryRecursively(writingsBaseDir);
  const queue = [...allNodes];

  while (queue.length > 0) {
    const node = queue.shift();
    if (node) {
      if (
        node.isDirectory === false &&
        typeof node.path === 'string' &&
        node.path.startsWith(writingsBaseDir) &&
        node.path.endsWith('.md')
      ) {
        let relativePath = node.path.substring(writingsBaseDir.length);
        if (relativePath.startsWith('/')) {
          relativePath = relativePath.substring(1);
        }
        const slugPath = relativePath.replace(/\.md$/, '');

        if (slugPath) {
          const lastModifiedDate = node.lastModified ? new Date(node.lastModified).toISOString() : new Date().toISOString();
          xml += `    <url>\n`;
          xml += `        <loc>${SITE_URL}/writings/${slugPath}</loc>\n`;
          xml += `        <lastmod>${lastModifiedDate}</lastmod>\n`;
          xml += `        <changefreq>weekly</changefreq>\n`;
          xml += `        <priority>0.8</priority>\n`;
          xml += `    </url>\n`;
        }
      } else if (node.isDirectory && node.children) {
        queue.push(...node.children);
      }
    }
  }

  xml += `</urlset>\n`;
  return xml;
}

const sitemapXmlContent = generateSitemapContent();
console.log(sitemapXmlContent);
