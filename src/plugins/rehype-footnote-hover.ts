// rehype-footnote-hover.ts
import { visit } from 'unist-util-visit'
import type { Element, ElementContent, Root } from 'hast'

// hastノードからテキストを抽出(脚注の戻りリンク↩は除外)
function extractText(node: ElementContent): string {
  if (node.type === 'text') return node.value
  if (node.type === 'element') {
    if (node.properties?.dataFootnoteBackref !== undefined) return ''
    return node.children.map(extractText).join('')
  }
  return ''
}

export default function rehypeFootnoteHover() {
  return (tree: Root) => {
    // 脚注テキストをもってくる
    const contents = new Map<string, string>()
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'li') return
      const id = node.properties?.id
      if (typeof id !== 'string' || !id.startsWith('user-content-fn-')) return
      contents.set(id, node.children.map(extractText).join('').trim())
    })

    // 本文中の参照リンクの隣にツールチップを挿入
    visit(tree, 'element', (node: Element, index, parent) => {
      if (
        node.tagName !== 'a' ||
        node.properties?.dataFootnoteRef !== true ||
        index === undefined ||
        !parent
      ) return

      const href = node.properties.href
      if (typeof href !== 'string') return
      const text = contents.get(href.slice(1)) // `#`を除く
      if (!text) return

      const tooltip: Element = {
        type: 'element',
        tagName: 'span',
        properties: { className: ['footnote-hover-tooltip'] },
        children: [{ type: 'text', value: text }],
      }
      parent.children.splice(index + 1, 0, tooltip)
      return index + 2 // tooltip自身をスキップ
    })
  }
}