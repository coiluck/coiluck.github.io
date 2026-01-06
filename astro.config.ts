// @ts-check
import { defineConfig } from 'astro/config';

// Markdownプラグイン
import remarkAttributes from 'remark-attributes';
import remarkLinkCardPlus from 'remark-link-card-plus';
import remarkToc from 'remark-toc';
import remarkCollapse from 'remark-collapse';
import rehypeSlug from 'rehype-slug';
import rehypeLinkBlank from './src/plugins/rehype-link-blank';

// sitemap
import sitemap from '@astrojs/sitemap';

import markdoc from '@astrojs/markdoc';

// expressive-code
import expressiveCode from "astro-expressive-code";

export default defineConfig({
  markdown: {
    remarkPlugins: [
      remarkAttributes as any,
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
      rehypeSlug,
      rehypeLinkBlank('blog-link')
    ],
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
    markdoc({
      allowHTML: true,
      ignoreIndentation: true
    })
  ]
});