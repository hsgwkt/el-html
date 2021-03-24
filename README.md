# el-html

[demo](https://hsgwkt.github.io/el-html/demo/)

```js
import { defineElement, html, props, view, reactive } from 'el-html.js'

defineElement('x-counter', (el) => {
  props(el, {
    label: 'count',
  })

  const state = reactive({
    count: 0,
  })

  function increment() {
    state.count++
  }

  function decrement() {
    state.count--
  }

  view(el, () => html`
    <div class=${['counter', { invalid: state.count > 10 }]}>
      ${el.label}: ${state.count}
    </div>
    <button onClick=${increment}>+</button>
    <button onClick=${decrement}>-</button>

    <style>
    .counter {
      color: green;

      &.invalid {
        color: red;
      }
    }
    </style>
  `)
})
```
