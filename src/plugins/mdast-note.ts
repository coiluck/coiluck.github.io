/*
Qiita みたいな注を出す

```markdown
:::warn
this is the content
:::
```

satteri の directive 機能で `:::warn` は containerDirective
（name="warn", children=本文ブロック）として渡ってくる。

```html
<aside class="note note--warn"><p>これはwarnです</p></aside>
```

の形で出力。
*/

import { defineMdastPlugin } from "satteri";

const VALID_NOTE_TYPE_ARRAY = ["info", "warn", "alert"] as const;
type NoteType = (typeof VALID_NOTE_TYPE_ARRAY)[number];

function isNoteType(name: string): name is NoteType {
  return (VALID_NOTE_TYPE_ARRAY as readonly string[]).includes(name);
}

export default function mdastNote() {
  return defineMdastPlugin({
    name: "mdastNote",
    containerDirective(node, ctx) {
      if (!isNoteType(node.name)) return;

      ctx.setProperty(node, "data", {
        hName: "aside",
        hProperties: { className: ["note", `note--${node.name}`] },
      });
    },
  });
}
