// rehype-link-blank.ts
import { visit } from 'unist-util-visit';

export default function rehypeLinkBlank(targetClassNames: string[]) {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' && node.properties) {
        const classList = node.properties.class || node.properties.className;
        let classArray: string[] = [];
        if (Array.isArray(classList)) {
          classArray = classList;
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