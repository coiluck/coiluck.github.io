// hast-footnote-hover.ts
import { defineHastPlugin } from "satteri";
import type { Element, ElementContent } from "hast";

// hastノードからテキストを抽出(脚注の戻りリンク↩は除外)
function extractText(node: ElementContent): string {
  if (node.type === "text") return node.value;
  if (node.type === "element") {
    if (node.properties?.dataFootnoteBackref !== undefined) return "";
    return node.children.map(extractText).join("");
  }
  return "";
}

const hastFootnoteHover = () => {
  // idとnode
  const refs = new Map<string, Readonly<Element>[]>();

  return defineHastPlugin({
    name: "hast-footnote-hover",
    element: [
      // 本文中の参照リンク
      {
        filter: ["a"],
        visit(node) {
          if (node.properties?.dataFootnoteRef !== true) return;
          const href = node.properties.href;
          if (typeof href !== "string") return;
          const id = href.slice(1); // `#` を除く

          const list = refs.get(id);
          if (list) list.push(node);
          else refs.set(id, [node]);
        },
      },
      // 脚注に到達 -> ツールチップを挿入
      {
        filter: ["li"],
        visit(node, ctx) {
          const id = node.properties?.id;
          if (typeof id !== "string" || !id.startsWith("user-content-fn-")) return;

          const targets = refs.get(id);
          if (!targets) return;

          const text = node.children.map(extractText).join("").trim();
          if (!text) return;

          for (const ref of targets) {
            const tooltip: Element = {
              type: "element",
              tagName: "span",
              properties: { className: ["footnote-hover-tooltip"] },
              children: [{ type: "text", value: text }],
            };
            ctx.insertAfter(ref, tooltip);
          }
        },
      },
    ],
  });
};

export default hastFootnoteHover;
