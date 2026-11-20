import Editor from "@/components/admin/Editor";
import { listDocs, listFolders, loadBook, loadDoc, type BookDoc, type Doc } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminPage({ params }: { params: { slug?: string[] } }) {
  const [docs, folders] = await Promise.all([listDocs(), listFolders()]);
  const slug = params.slug?.map(decodeURIComponent);
  let doc: Doc | null = null;
  let book: BookDoc | null = null;
  if (slug?.length) {
    try {
      doc = await loadDoc(slug);
    } catch {
      doc = null;
    }
    // A book's folder (e.g. /admin/life/my-book) opens the book's settings.
    if (!doc && slug.length === 2) book = await loadBook(slug).catch(() => null);
  }
  return (
    <Editor folders={folders} key={slug?.join("/") ?? "none"} docs={docs} doc={doc} book={book} missing={!!slug?.length && !doc && !book} />
  );
}
