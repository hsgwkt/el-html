import { effect, reactive } from '@vue/reactivity'
import { render, ComponentChild } from 'preact'
import { defineElementProperties } from './property'

export function props<E extends Element, P extends object>(el: E, props: P): asserts el is E & P {
  defineElementProperties(el, reactive(props))
}

export function view(el: Element, getVNode: () => ComponentChild) {
  const shadowRoot = el.shadowRoot || el.attachShadow({ mode: 'open' })
  effect(() => render(getVNode(), shadowRoot))
}
