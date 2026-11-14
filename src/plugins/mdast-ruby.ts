/*

`[base]!ruby?`

で

`<ruby>base<rt>ruby</rt></ruby>`

*/

import { type MdastContent, defineMdastPlugin } from "satteri";
import { escapeHtml } from "../utils/escapeHtml";

const PATTERN = /\[([^\]]{1,20})\]!([^?]{1,20})\?/g;

export default function mdastRuby() {
  return defineMdastPlugin({
    name: "mdastRuby",
    text(node, ctx) {
      const matches = Array.from(node.value.matchAll(PATTERN));
      if (matches.length === 0) return;

      let cursor = 0;
      const result: MdastContent[] = []

      for (const m of matches) {
        const base = m[1];
        const rt = m[2];

        const prev = node.value.slice(cursor, m.index);
        result.push({ type: "text", value: prev });
        result.push({ type: "html", value: `<ruby>${escapeHtml(base)}<rt>${escapeHtml(rt)}</rt></ruby>` })
        cursor = m.index + m[0].length
      }
      result.push({ type: "text", value: node.value.slice(cursor) });
       
      ctx.replaceNode(node, result)
    }
  })
}
