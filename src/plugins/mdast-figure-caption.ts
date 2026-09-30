/*
```markdown
:::figure{src="/img.png" alt="alt"}
キャプション
:::
```

で

```html
<figure>
  <img src="/img.png" alt="alt">
  <figcaption>キャプション</figcaption>
</figure>
```

にする
*/

import { defineMdastPlugin } from "satteri";
import { escapeHtml } from "../utils/escapeHtml";

const VALID_NAME_ARRAY = ["figure", "fig", "image", "img"];

interface Figure {
  src: string;
  alt: string | null;
  caption: string;
}

export default function mdastFigureCaption() {
  return defineMdastPlugin({
    name: "mdastFigureCaption",
    containerDirective(node, ctx) {
      if (!VALID_NAME_ARRAY.includes(node.name)) return;

      const { src = "", alt = "" } = node.attributes ?? {};
      if (!src) {
        return;
      }

      const caption = ctx.textContent(node).trim();
      return { rawHtml: createFigureHtml({ src, alt, caption }) };
    },
  });
}

function createFigureHtml({ src, alt, caption }: Figure): string {
  const figcaption = caption
    ? `<figcaption>${escapeHtml(caption)}</figcaption>`
    : "";
  return `<figure>
  <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">
  ${figcaption}
</figure>`;
}
