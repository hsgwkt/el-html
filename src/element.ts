export class El extends HTMLElement {}

export function defineElement<T extends El>(name: string, ctor: (el: El) => T | void): new () => T {
  customElements.define(
    name,
    class extends El {
      constructor() {
        super()
        return ctor(this) || this
      }
    },
  )
  return customElements.get(name)
}
