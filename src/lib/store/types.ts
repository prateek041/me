/**
 * Where the editor reads and writes posts. Paths are relative to the repo root
 * (e.g. "writings/life/my-book/chapter-1.mdx").
 *
 * Every file has a `version`. A write passes the version it was based on; if the
 * file changed since (saved from another device), the write fails with
 * ConflictError instead of overwriting.
 */
export interface StoredFile {
  text: string;
  version: string;
}

export interface ContentStore {
  mode: "local" | "github";
  /** Every text file under writings/, as the editor sees it (drafts included). */
  snapshot(): Promise<Map<string, StoredFile>>;
  read(path: string): Promise<StoredFile | null>;
  /** Save a working copy. `expected` = version it was based on; null = must not exist yet; undefined = don't check. */
  write(path: string, text: string, opts: { expected?: string | null; message: string }): Promise<{ version: string }>;
  /** Put this exact text live (GitHub: commit to main). Local: same as write. `onlyIfLive`: skip files that were never published. */
  publish(path: string, text: string, message: string, opts?: { onlyIfLive?: boolean }): Promise<void>;
  /** Bring changes made on the live branch into the working copy (GitHub: merge main into drafts). */
  sync(): Promise<void>;
}

export class ConflictError extends Error {
  constructor(public path: string) {
    super(`${path} was changed somewhere else since you opened it`);
    this.name = "ConflictError";
  }
}
