// Turns GitHub-style alerts into <Callout> components:
//   > [!NOTE]
//   > Text.
// Supported: NOTE, TIP, WARNING, IMPORTANT (shown as note), CAUTION (shown as warning).
const TYPES = { NOTE: "note", TIP: "tip", WARNING: "warning", IMPORTANT: "note", CAUTION: "warning" };

function walk(node) {
  if (!node.children) return;
  node.children = node.children.map((child) => {
    if (child.type === "blockquote") {
      const first = child.children[0];
      const text = first && first.type === "paragraph" ? first.children[0] : null;
      const m = text && text.type === "text" && text.value.match(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*/i);
      if (m) {
        text.value = text.value.slice(m[0].length);
        if (!text.value) first.children.shift();
        if (first.children.length === 0) child.children.shift();
        return {
          type: "mdxJsxFlowElement",
          name: "Callout",
          attributes: [{ type: "mdxJsxAttribute", name: "type", value: TYPES[m[1].toUpperCase()] }],
          children: child.children,
        };
      }
    }
    walk(child);
    return child;
  });
}

export default function remarkCallouts() {
  return (tree) => walk(tree);
}
