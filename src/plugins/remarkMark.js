import { visit } from 'unist-util-visit'

export function remarkMark() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === undefined) return

      const parts = node.value.split(/(==[^=]+==)/g)
      if (parts.length <= 1) return

      const children = parts.map((part) => {
        if (part.startsWith('==') && part.endsWith('==')) {
          const text = part.slice(2, -2)
          return {
            type: 'html',
            value: `<mark>${text}</mark>`,
          }
        }
        return { type: 'text', value: part }
      })

      parent.children.splice(index, 1, ...children)
    })
  }
}
