import { h } from 'preact'
import htm from 'htm'
import clsx from 'clsx'
import { compile, serialize, stringify } from 'stylis'

export const html = htm.bind((type, props, ...children) => {
  if (props?.class) {
    props.class = clsx(props.class)
  }

  if (type === 'style') {
    children = [serialize(compile(children.join('')), stringify)]
  }

  return h(type, props, ...children)
})

export function css(strings: TemplateStringsArray, ...values: unknown[]) {
  const src = values.reduce<string>((p, v, i) => p + v + strings[i + 1], strings[0])
  return html`<style>
    ${src}
  </style>`
}
