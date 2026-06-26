import { defineHastPlugin } from "satteri";

const hastLinkBlank = defineHastPlugin({
  name: "hast-link-blank",
  element: {
    filter: ["a"],
    visit(node, ctx) {
      const href = node.properties.href;
      if (typeof href === "string" && href.startsWith("http")) {
        ctx.setProperty(node, "target", "_blank");
        ctx.setProperty(node, "rel", "noopener noreferrer");
      }
    },
  },
});

export default hastLinkBlank