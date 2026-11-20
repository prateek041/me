import fs from "node:fs";
import path from "node:path";
import { ConflictError, type ContentStore, type StoredFile } from "./types";

const ROOT = process.cwd();
const TEXT = /\.(mdx?|json)$/;

function abs(rel: string) {
  const p = path.resolve(ROOT, rel);
  if (!p.startsWith(path.join(ROOT, "writings") + path.sep)) throw new Error("Invalid path");
  return p;
}

const version = (file: string) => String(Math.round(fs.statSync(file).mtimeMs));

/** Local mode: the files in ./writings on this machine. Versions are modification times. */
export const localStore: ContentStore = {
  mode: "local",

  async snapshot() {
    const out = new Map<string, StoredFile>();
    const walk = (dir: string) => {
      for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        if (fs.statSync(full).isDirectory()) walk(full);
        else if (TEXT.test(name)) out.set(path.relative(ROOT, full), { text: fs.readFileSync(full, "utf8"), version: version(full) });
      }
    };
    walk(path.join(ROOT, "writings"));
    return out;
  },

  async read(rel) {
    const file = abs(rel);
    return fs.existsSync(file) ? { text: fs.readFileSync(file, "utf8"), version: version(file) } : null;
  },

  async write(rel, text, { expected }) {
    const file = abs(rel);
    const exists = fs.existsSync(file);
    if (expected === null && exists) throw new ConflictError(rel);
    if (expected && exists && version(file) !== expected) throw new ConflictError(rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
    return { version: version(file) };
  },

  async publish(rel, text) {
    const file = abs(rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
  },

  async sync() {},
};
