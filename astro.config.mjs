// @ts-check
import { defineConfig } from 'astro/config';

// Markdownプラグインをインポート
import remarkGfm from 'remark-gfm';
import remarkAttributes from 'remark-attributes';
import remarkLinkCardPlus from 'remark-link-card-plus';
import remarkToc from 'remark-toc';
import remarkCollapse from 'remark-collapse';
import rehypeSlug from 'rehype-slug';

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
      [remarkToc, {
        heading: "目次|Contents",
        maxDepth: 4
      }],
      [remarkCollapse, {
        test: "目次|Contents",
        summary: "目次",
      }]
    ],
    rehypePlugins: [
      rehypeSlug
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