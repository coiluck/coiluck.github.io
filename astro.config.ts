import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';

// Sätteri plugin
import mdastTocCollapse from './src/plugins/mdast-toc-collapse';
import mdastLinkCard from './src/plugins/mdast-link-card';
import hastLinkBlank from './src/plugins/hast-link-blank'

// sitemap
import sitemap from '@astrojs/sitemap';

import markdoc from '@astrojs/markdoc';

// syntax highlight
import expressiveCode from "satteri-expressive-code";
import astroExpressiveCode from "astro-expressive-code";

export default defineConfig({
  markdown: {
    syntaxHighlight: false,
    processor: satteri({
      features: {
        directive: true,
        math: true,
        headingAttributes: true,
      },
      mdastPlugins: [
        mdastTocCollapse,
       mdastLinkCard({ thumbnailPosition: "left" })
      ],
      hastPlugins: [
        hastLinkBlank,
        expressiveCode({
          themes: ["light-plus", "dark-plus"],
          themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
          useDarkModeMediaQuery: false,
        }),
      ],
    }),
  },
  build: {
    format: 'directory'
  },
  site: 'https://coiluck.moe',
  integrations: [
    sitemap(),
    astroExpressiveCode(), // codeコンポーネント用（設定は ec.config.mjs）
    markdoc({
      allowHTML: true,
      ignoreIndentation: true
    })
  ]
});