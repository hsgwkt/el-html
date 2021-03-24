type AttrValue = null | string
type AttrParser = (value: AttrValue) => unknown
type AttrSetter = (value: AttrValue) => void

const attrElMap = new WeakMap<Element, Map<string, AttrSetter[]>>()

const attrObserver = new MutationObserver((records) => {
  for (const { target, attributeName } of records) {
    if (target instanceof Element && attributeName) {
      const nameMap = attrElMap.get(target)
      if (nameMap) {
        const value = target.getAttribute(attributeName)
        const setters = nameMap.get(attributeName) || []
        setters.forEach((setter) => setter(value))
      }
    }
  }
})

function defineAttr(el: Element, name: string, setter: AttrSetter) {
  let nameMap = attrElMap.get(el)
  if (!nameMap) {
    nameMap = new Map()
    attrElMap.set(el, nameMap)
  }

  let setters = nameMap.get(name)
  if (!setters) {
    setters = []
    nameMap.set(name, setters)
  }

  setters.push(setter)
  attrObserver.observe(el, {
    attributes: true,
    attributeFilter: [...nameMap.keys()],
  })
}

function parseObject(value: AttrValue) {
  try {
    return Function(`"use strict";return (${value})`)()
  } catch {
    return undefined
  }
}

function parseNumber(value: AttrValue) {
  if (value === null) {
    return NaN
  }
  const str = value.trim()
  return str ? Number(str) : NaN
}

function parseString(value: AttrValue) {
  return value === null ? undefined : value
}

const parsers: Record<string, AttrParser> = {
  undefined: parseString,
  boolean: (value) => value !== null && value !== undefined,
  number: parseNumber,
  bigint: parseNumber,
  string: parseString,
  symbol: (value) => (value ? Symbol.for(value) : undefined),
  function: parseObject,
  object: parseObject,
}

function isInvalid(value: unknown) {
  return value === undefined || Number.isNaN(value)
}

export type AccessorConfig<T> = {
  default: T
  get: () => T
  set: (value: T) => void
}

export function defineElementProperty<E extends Element, P extends string, T>(
  el: E,
  propName: P,
  config: AccessorConfig<T>,
): asserts el is E & Record<P, T> {
  const attrParser = parsers[typeof config.default]
  const setter = (value: unknown) => {
    if (typeof value === 'string') {
      value = attrParser(value) as T
    }

    if (isInvalid(value)) {
      value = config.default
    }

    config.set(value as T)
  }

  const attrName = propName.replace(/(?=[A-Z])/g, '-').toLowerCase()
  const attrSetter = (value: AttrValue) => setter(attrParser(value))

  let initialValue: unknown

  if (el.hasAttribute(attrName)) {
    initialValue = attrParser(el.getAttribute(attrName))
    el.removeAttribute(attrName)
  }

  if (isInvalid(initialValue)) {
    const value = Reflect.get(el, propName)
    initialValue = typeof value === 'string' ? attrParser(value) : value
  }

  if (isInvalid(initialValue)) {
    initialValue = config.default
  }

  setter(initialValue)

  Object.defineProperty(el, propName, { get: config.get, set: setter })
  defineAttr(el, attrName, attrSetter)
}

export function defineElementProperties<E extends Element, D extends object>(el: E, data: D): asserts el is E & D {
  for (const [name, defaultValue] of Object.entries(data)) {
    defineElementProperty(el, name, {
      default: defaultValue,
      get: () => Reflect.get(data, name),
      set: (value) => Reflect.set(data, name, value),
    })
  }
}
