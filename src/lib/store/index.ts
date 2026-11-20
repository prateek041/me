import { githubStore } from "./github";
import { localStore } from "./local";
import type { ContentStore } from "./types";

export { ConflictError } from "./types";
export type { ContentStore, StoredFile } from "./types";

/**
 * Local files in development, GitHub when deployed. Set EDITOR_STORE=github in
 * .env.local to try the GitHub mode while running locally.
 */
export function getStore(): ContentStore {
  const want = process.env.EDITOR_STORE ?? (process.env.NODE_ENV === "production" ? "github" : "local");
  return want === "github" ? githubStore : localStore;
}
