// rehype-link-blank.ts
import { visit } from 'unist-util-visit';
import type { Root } from 'hast';

export default function rehypeLinkBlank(targetClassNames: string[]) {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' && node.properties) {
        const classList = node.properties.class || node.properties.className;
        let classArray: string[] = [];
        if (Array.isArray(classList)) {
          classArray = classList.filter((c): c is string => typeof c === 'string');
        } else if (typeof classList === 'string') {
          classArray = classList.split(' ');
        }
        
        const hasTargetClass = targetClassNames.some(targetClass => 
          classArray.includes(targetClass)
        );
        if (hasTargetClass) {
          node.properties.target = '_blank';
          node.properties.rel = 'noopener noreferrer';
        }
      }
    });
  };
}