/*
<img src="path/to/img" alt="alt属性はmdがサポート">

に

width="", height="", loading="lazy", decoding="async"

をつける
*/

import { defineHastPlugin } from "satteri";
import { imageSizeFromFile } from 'image-size/fromFile';
import path from  "node:path";

interface Size {
  w: number
  h: number
}

export default function hastImageAttrs() {
  return defineHastPlugin({
    name: "hast-image-attrs",
    element: {
      filter: ["img"],
      async visit(node, ctx) {
        const src = node.properties.src;
        if (typeof src !== "string") return

        ctx.setProperty(node, "loading", "lazy");
        ctx.setProperty(node, "decoding", "async");

        const result = await getImgSize(src)

        if (!result) return;

        ctx.setProperty(node, "width", result.w);
        ctx.setProperty(node, "height", result.h);
      },
    }
  })
}

export const getImgSize = async (p: string): Promise<Size | null> => {
  let width = null;
  let height = null;

  if (p.startsWith("/") && !p.startsWith("//")) {
    // ローカルの画像
    try {
      const filePath = path.join(process.cwd(), "public", decodeURI(p));

      const data = await imageSizeFromFile(filePath);
      const w = data.width;
      const h = data.height;

      if (w && h) {
        width = w;
        height = h;
      }
    } catch (e) {
      console.error(`[hast-image-attrs] cannot get ${p} img`, e)
    }
  }

  return width && height
   ? { w: width, h: height }
   : null
}
