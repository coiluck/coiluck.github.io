// rehype-link-blank.ts
import { visit } from 'unist-util-visit';

export default function rehypeLinkBlank(targetClassName: string) {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' && node.properties) {
        const classList = node.properties.class || node.properties.className;
        if (Array.isArray(classList) && classList.includes(targetClassName)) {
          node.properties.target = '_blank';
          node.properties.rel = 'noopener noreferrer';
        }
      }
    });
  };
}