// @ts-check
import { defineConfig } from 'astro/config';

// Markdownプラグインをインポート
import remarkAttributes from 'remark-attributes';
import remarkLinkCardPlus from 'remark-link-card-plus';
import remarkToc from 'remark-toc';
import remarkCollapse from 'remark-collapse';
import rehypeSlug from 'rehype-slug';

// sitemap
import sitemap from '@astrojs/sitemap';
import markdoc from '@astrojs/markdoc';

// expressive-code
import expressiveCode from "astro-expressive-code";

import { visit } from 'unist-util-visit';

function rehypeLinkBlank() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' && node.properties) {
        const classList = node.properties.class || node.properties.className;
        if (Array.isArray(classList) && classList.includes('blog-link')) {
          node.properties.target = '_blank';
          node.properties.rel = 'noopener noreferrer';
        }
      }
    });
  };
}

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
      rehypeLinkBlank
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