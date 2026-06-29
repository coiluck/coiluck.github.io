import { defineEcConfig } from "astro-expressive-code";

export default defineEcConfig({
  themes: ["light-plus", "dark-plus"],
  themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
  useDarkModeMediaQuery: false,
});
