import { ConflictError, type ContentStore, type StoredFile } from "./types";

/*
 * GitHub mode, for the deployed editor.
 *   drafts branch: the working copy. Every save is a commit here. Vercel does not build it.
 *   main branch:   what is live. Publishing commits the file here; Vercel rebuilds.
 * Versions are git blob SHAs on the drafts branch.
 */

const API = "https://api.github.com";
const DRAFTS = "drafts";
const LIVE = "main";

function config() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO; // "owner/name"
  if (!token || !repo || !repo.includes("/")) throw new Error("GITHUB_TOKEN and GITHUB_REPO must be set for the online editor");
  const [owner, name] = repo.split("/");
  return { token, repo, owner, name };
}

async function gh(path: string, init: RequestInit = {}) {
  const { token } = config();
  const res = await fetch(`${API}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  return res;
}

async function ghJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await gh(path, init);
  if (!res.ok) throw new Error(`GitHub ${init?.method ?? "GET"} ${path}: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

const enc = (p: string) => p.split("/").map(encodeURIComponent).join("/");
const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");

/** Current blob SHA of a file on a branch, or null if it doesn't exist. */
async function shaOn(path: string, branch: string): Promise<string | null> {
  const { repo } = config();
  const res = await gh(`/repos/${repo}/contents/${enc(path)}?ref=${branch}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read ${path}: ${res.status}`);
  return ((await res.json()) as { sha: string }).sha;
}

async function put(path: string, text: string, branch: string, message: string, sha?: string | null) {
  const { repo } = config();
  const res = await gh(`/repos/${repo}/contents/${enc(path)}`, {
    method: "PUT",
    body: JSON.stringify({ message, content: b64(text), branch, ...(sha ? { sha } : {}) }),
  });
  // 409: sha doesn't match the file; 422: sha missing for an existing file (or given for a missing one).
  if (res.status === 409 || res.status === 422) throw new ConflictError(path);
  if (!res.ok) throw new Error(`GitHub write ${path}: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { content: { sha: string } }).content.sha;
}

/** Make sure the drafts branch exists (created from main the first time). */
async function ensureDrafts() {
  const { repo } = config();
  const res = await gh(`/repos/${repo}/git/ref/heads/${DRAFTS}`);
  if (res.ok) return;
  if (res.status !== 404) throw new Error(`GitHub branch check: ${res.status}`);
  const main = await ghJson<{ object: { sha: string } }>(`/repos/${repo}/git/ref/heads/${LIVE}`);
  await ghJson(`/repos/${repo}/git/refs`, { method: "POST", body: JSON.stringify({ ref: `refs/heads/${DRAFTS}`, sha: main.object.sha }) });
}

// Four levels below writings/ covers section/book/chapter and the deepest existing folders.
const ENTRY = (depth: number): string =>
  depth === 0 ? "name type object { ... on Blob { oid text isBinary } }" : `name type object { ... on Blob { oid text isBinary } ... on Tree { entries { ${ENTRY(depth - 1)} } } }`;

interface GqlEntry {
  name: string;
  type: "blob" | "tree";
  object: { oid?: string; text?: string | null; isBinary?: boolean; entries?: GqlEntry[] } | null;
}

export const githubStore: ContentStore = {
  mode: "github",

  async snapshot() {
    await ensureDrafts();
    const { owner, name } = config();
    const query = `query($owner:String!,$name:String!,$expr:String!){ repository(owner:$owner,name:$name){ object(expression:$expr){ ... on Tree { entries { ${ENTRY(4)} } } } } }`;
    const data = await ghJson<{ data?: { repository: { object: { entries: GqlEntry[] } | null } }; errors?: { message: string }[] }>("/graphql", {
      method: "POST",
      body: JSON.stringify({ query, variables: { owner, name, expr: `${DRAFTS}:writings` } }),
    });
    if (data.errors?.length) throw new Error(`GitHub: ${data.errors[0].message}`);
    const out = new Map<string, StoredFile>();
    const walk = (entries: GqlEntry[], dir: string) => {
      for (const e of entries) {
        const p = `${dir}/${e.name}`;
        if (e.type === "tree" && e.object?.entries) walk(e.object.entries, p);
        else if (e.type === "blob" && /\.(mdx?|json)$/.test(e.name) && e.object?.text != null && e.object.oid)
          out.set(p, { text: e.object.text, version: e.object.oid });
      }
    };
    walk(data.data?.repository.object?.entries ?? [], "writings");
    return out;
  },

  async read(path) {
    const { repo } = config();
    const res = await gh(`/repos/${repo}/contents/${enc(path)}?ref=${DRAFTS}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub read ${path}: ${res.status}`);
    const j = (await res.json()) as { sha: string; content: string };
    return { text: Buffer.from(j.content, "base64").toString("utf8"), version: j.sha };
  },

  async write(path, text, { expected, message }) {
    await ensureDrafts();
    let sha: string | null | undefined = expected;
    if (expected === undefined) sha = await shaOn(path, DRAFTS); // no check: overwrite whatever is there
    return { version: await put(path, text, DRAFTS, message, sha) };
  },

  async publish(path, text, message, opts) {
    const sha = await shaOn(path, LIVE);
    if (!sha && opts?.onlyIfLive) return;
    await put(path, text, LIVE, message, sha);
  },

  async sync() {
    await ensureDrafts();
    const { repo } = config();
    // Bring anything pushed to main (e.g. from the laptop) into drafts. 201 merged, 204 nothing to do.
    const res = await gh(`/repos/${repo}/merges`, {
      method: "POST",
      body: JSON.stringify({ base: DRAFTS, head: LIVE, commit_message: "Sync drafts with main" }),
    });
    if (res.status === 409) throw new Error("drafts and main have conflicting changes; resolve them in git");
    if (!res.ok && res.status !== 204) throw new Error(`GitHub sync: ${res.status}`);
  },
};
