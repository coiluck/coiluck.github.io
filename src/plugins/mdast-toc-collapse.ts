import { defineMdastPlugin } from "satteri";
import type { Root, RootContent, Heading, List, ListItem, Html } from "mdast";
import GithubSlugger from "github-slugger";

const HEADINGS_MARKER = "<!-- headings -->";

interface TocOptions {
  maxDepth?: number;
  summary?: string;
}

// 空の子リストを取り除く
function pruneEmptyLists(list: List): List {
  const children = list.children.flatMap((item): ListItem[] => {
    const newChildren = item.children.flatMap((child): ListItem["children"] => {
      if (child.type === "list") {
        const pruned = pruneEmptyLists(child);
        return pruned.children.length > 0 ? [pruned] : [];
      }
      return [child];
    });
    return [{ ...item, children: newChildren }];
  });
  return { ...list, children };
}

// 見出しから入れ子リストを組む（remark-toc 相当）
function buildTocList(headings: Heading[], texts: string[], slugs: string[], maxDepth: number): List {
  const root: List = { type: "list", ordered: false, spread: false, children: [] };
  // depth ごとに「いま追記すべき list」をスタックで保持
  const stack: { depth: number; list: List }[] = [{ depth: 0, list: root }];

  headings.forEach((h, i) => {
    if (h.depth > maxDepth) return;

    const text = texts[i];
    const slug = slugs[i];
    const item: ListItem = {
      type: "listItem",
      spread: false,
      children: [
        {
          type: "paragraph",
          children: [
            { type: "link", url: `#${slug}`, children: [{ type: "text", value: text }] },
          ],
        },
      ],
    };

    // 自分と同じか浅いものはスタックから外す
    while (stack.length > 1 && stack[stack.length - 1].depth >= h.depth) {
      stack.pop();
    }
    const parentList = stack[stack.length - 1].list;
    parentList.children.push(item);

    // この item の子リストを用意してスタックに積む
    const childList: List = { type: "list", ordered: false, spread: false, children: [] };
    item.children.push(childList);
    stack.push({ depth: h.depth, list: childList });
  });

  return pruneEmptyLists(root);
}


export default function mdastHeadingsToc(opts: TocOptions = {}) {
  const maxDepth = opts.maxDepth ?? 4;
  const summary = opts.summary ?? "目次";

  // root は heading ビジターから ctx.parent() で取り、一度だけ処理する
  const done = new WeakSet<object>();

  return defineMdastPlugin({
    name: "mdastHeadingsToc",
    heading(node, ctx) {
      const parent = ctx.parent(node);
      // 見出しの親が root（最上位）でなければ対象外
      if (!parent || ctx.parent(parent) !== undefined) return;
      if (done.has(parent)) return;
      done.add(parent);

      const root = parent as Root;
      const children = root.children as RootContent[];

      // マーカーコメントを探す
      const markerIndex = children.findIndex(
        (c) => c.type === "html" && (c as Html).value.trim() === HEADINGS_MARKER,
      );
      if (markerIndex === -1) return;
      const markerNode = children[markerIndex];

      // 文書中の見出しを収集
      const headings: Heading[] = [];
      const texts: string[] = [];
      for (const c of children) {
        if (c.type === "heading") {
          headings.push(c as Heading);
          texts.push(ctx.textContent(c));
        }
      }

      // slugを生成
      const slugger = new GithubSlugger();
      const slugs = texts.map((text) => slugger.slug(text));

      const list = buildTocList(headings, texts, slugs, maxDepth);
      const open: Html = { type: "html", value: `<details>\n<summary>${summary}</summary>` };
      const closing: Html = { type: "html", value: "</details>" };

      // 置換（コメントは消える）
      ctx.insertBefore(markerNode, [open, list as RootContent]);
      ctx.insertAfter(markerNode, closing);
      ctx.removeNode(markerNode);
    },
  });
}
