// @ts-check
import { defineConfig } from 'astro/config';

// Markdownプラグインをインポート
import remarkGfm from 'remark-gfm';
import remarkAttributes from 'remark-attributes';
import remarkLinkCardPlus from 'remark-link-card-plus';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// sitemap
import sitemap from '@astrojs/sitemap';

// expressive-code
import expressiveCode from "astro-expressive-code";


export default defineConfig({
  markdown: {
    gfm: false,
    remarkPlugins: [
      remarkGfm,
      remarkAttributes,
      [remarkLinkCardPlus, {
        cache: false,
        shortenUrl: true,
        thumbnailPosition: "left"
      }],
    ],
    rehypePlugins: [
      rehypeSlug,
      rehypeAutolinkHeadings
    ],
    allowHTML: true,
    syntaxHighlight: false,
  },
  build: {
    format: 'directory'
  },
  site: 'https://coiluck.moe',
  integrations: [
    sitemap(),
    expressiveCode({
      themes: ["dark-plus"],
    }),
  ]
});