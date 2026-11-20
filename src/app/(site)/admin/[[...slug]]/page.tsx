import Editor from "@/components/admin/Editor";
import { listDocs, listFolders, loadDoc, type Doc } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminPage({ params }: { params: { slug?: string[] } }) {
  const [docs, folders] = await Promise.all([listDocs(), listFolders()]);
  const slug = params.slug?.map(decodeURIComponent);
  let doc: Doc | null = null;
  if (slug?.length) {
    try {
      doc = await loadDoc(slug);
    } catch {
      doc = null;
    }
  }
  return <Editor folders={folders} key={slug?.join("/") ?? "none"} docs={docs} doc={doc} missing={!!slug?.length && !doc} />;
}
