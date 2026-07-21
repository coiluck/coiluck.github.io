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

function escapeHtml(value: string | null): string {
  if (!value) return ''

  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
