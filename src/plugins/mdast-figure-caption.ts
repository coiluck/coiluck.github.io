/*
```markdown
:::figure{src="/img.png" alt="alt"}
キャプション
:::
```

で

```html
<figure>
  <img 
    src="/img.png"
    alt="alt"
    width=""
    height=""
    loading="lazy"
    decoding="async"
  >
  <figcaption>キャプション</figcaption>
</figure>
```

にする
*/

import { defineMdastPlugin } from "satteri";
import { escapeHtml } from "../utils/escapeHtml";
import { getImgSize } from "./hast-image-attrs";

const VALID_NAME_ARRAY = ["figure", "fig", "image", "img"];

interface Figure {
  src: string;
  alt: string | null;
  caption: string;
  size: { w: number; h: number } | null;
}

export default function mdastFigureCaption() {
  return defineMdastPlugin({
    name: "mdastFigureCaption",
    async containerDirective(node, ctx) {
      if (!VALID_NAME_ARRAY.includes(node.name)) return;

      const { src = "", alt = "" } = node.attributes ?? {};
      if (!src) {
        return;
      }

      const caption = ctx.textContent(node).trim();
      const size = await getImgSize(src);
      return { rawHtml: createFigureHtml({ src, alt, caption, size }) };
    },
  });
}

function createFigureHtml({ src, alt, caption, size }: Figure): string {
  const sizeAttrs = size ? ` width="${size.w}" height="${size.h}"` : "";
  const figcaption = caption
    ? `<figcaption>${escapeHtml(caption)}</figcaption>`
    : "";
  return `<figure>
  <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${sizeAttrs} loading="lazy" decoding="async">
  ${figcaption}
</figure>`;
}
