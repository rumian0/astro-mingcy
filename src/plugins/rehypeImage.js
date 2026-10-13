import { h } from 'hastscript'
import { visit } from 'unist-util-visit'

export function rehypeImage() {
  return function (tree) {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'p' && node.children.length === 1) {
        const child = node.children[0]
        if (child.tagName === 'img') {
          parent.children[index] = buildFigure(child)
        }
      } else if (node.tagName === 'img') {
        parent.children[index] = buildImage(node)
      }
    })
  }
}

function buildImage(node) {
  const imgProps = node.properties
  const alt = imgProps.alt || ''

  return h('img', {
    ...imgProps,
    loading: 'lazy',
    'data-fancybox': 'article',
    'data-caption': alt,
  })
}

function buildFigure(node) {
  let imgAlt = node.properties.alt
  if (imgAlt) {
    imgAlt = imgAlt.trim()
  }

  return h('figure', null, [buildImage(node), imgAlt ? h('figcaption', imgAlt) : null])
}
