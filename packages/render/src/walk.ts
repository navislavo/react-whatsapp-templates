import { hostKindOf, type HostKind } from '@react-whatsapp-templates/components'
import {
  createVarToken,
  propOf,
  slotDeclaration,
  type ComponentIR,
  type LanguageCode,
  type SlotDeclaration,
  type SlotIR,
  type TemplateCategory,
  type TemplateIR,
  type Var,
  type Vars,
} from '@react-whatsapp-templates/core'
import { Fragment, isValidElement, type ReactElement, type ReactNode } from 'react'

/**
 * Thrown when a tree is not a template at all. Violations of Meta's rules are
 * diagnostics from the validator, not exceptions from the walker (ADR-0003).
 */
export class WalkError extends Error {
  override name = 'WalkError'
}

/** A template authored as a component, whose props arrive as opaque tokens. */
export type TemplateComponent<P> = (props: Vars<P>) => ReactNode

/**
 * What the compilers accept: the component itself — the only form that can
 * carry props, since an author cannot mint a `Var` — or an element of a
 * template that has none.
 */
export type AnyTemplate = TemplateComponent<never> | ReactNode

/** A template with no props at all. */
export type EmptyProps = Record<string, never>

/**
 * The values a template must be sent with, recovered from the component through
 * the phantom type each token carries. Real values, never tokens.
 */
export type PropsOf<T> = T extends (props: infer P) => unknown
  ? P extends Vars<infer Q>
    ? Q
    : EmptyProps
  : EmptyProps

type Props = Record<string, unknown>

/** A host component reached by the walk, paired with the Meta component it maps onto. */
interface HostNode {
  readonly kind: HostKind
  readonly props: Props
}

/**
 * Evaluates a template component and its children into a {@link TemplateIR}.
 *
 * A synchronous tree walk — not a renderer and not a reconciler. A template is
 * a fixed shallow schema, so the walk evaluates through function components and
 * Fragments until it reaches host components.
 *
 * The component is evaluated exactly once, with every prop replaced by an
 * opaque token (ADR-0001). The send payload carries no rendered text, so there
 * is never a second evaluation with real values.
 */
export function walk(template: AnyTemplate): TemplateIR {
  const { node, props } = evaluateRoot(template)
  const roots = collectHosts(node)
  const root = roots[0]

  if (roots.length !== 1 || root === undefined || root.kind !== 'template') {
    throw new WalkError('A template must evaluate to a single <Template> element.')
  }

  const components: ComponentIR[] = []
  const slots: SlotIR[] = []

  for (const child of collectHosts(root.props['children'] as ReactNode)) {
    switch (child.kind) {
      case 'body':
        components.push({ kind: 'body', text: bodyText(child.props['children'], slots) })
        break
      case 'template':
        throw new WalkError('<Template> cannot be nested inside another <Template>.')
    }
  }

  return {
    name: stringProp(root.props, 'name'),
    language: stringProp(root.props, 'language') as LanguageCode,
    category: stringProp(root.props, 'category') as TemplateCategory,
    components,
    slots: mergeSlots(slots),
    props,
  }
}

/**
 * Evaluates the component with token props, or takes an element as it stands.
 * The props a template has are the ones it reads: `Vars<P>` is erased by the
 * time the walk runs, so nothing else about them can be known.
 */
function evaluateRoot(template: AnyTemplate): { node: ReactNode; props: string[] } {
  if (typeof template !== 'function') return { node: template, props: [] }

  if (hostKindOf(template) !== undefined) {
    throw new WalkError(
      'A template is your own component, or an element of one — not one of ours. ' +
        'Did you mean <Template …>?',
    )
  }

  const read: string[] = []
  const component = template as (props: Props) => ReactNode
  return { node: component(tokenProps(read)), props: read }
}

/** Mints one token per prop the component reads, in the order it reads them. */
function tokenProps(read: string[]): Props {
  const tokens = new Map<string, Var<unknown>>()

  return new Proxy({} as Props, {
    get(_target, key): unknown {
      // A symbol key is the runtime probing the object, never a prop.
      if (typeof key !== 'string') return undefined

      const existing = tokens.get(key)
      if (existing !== undefined) return existing

      const token = createVarToken(key)
      tokens.set(key, token)
      read.push(key)
      return token
    },
    has(_target, key): boolean {
      return typeof key === 'string'
    },
  })
}

/**
 * Flattens a node into the host components it evaluates to, calling the
 * author's own components and unwrapping Fragments and arrays on the way down.
 */
function collectHosts(node: ReactNode): HostNode[] {
  const found: HostNode[] = []
  visit(node, found)
  return found
}

function visit(node: ReactNode, found: HostNode[]): void {
  if (node === null || node === undefined || typeof node === 'boolean') return

  if (Array.isArray(node)) {
    for (const child of node as ReactNode[]) visit(child, found)
    return
  }

  if (typeof node === 'string' || typeof node === 'number') {
    throw new WalkError(
      `Loose text is not allowed between template components: ${JSON.stringify(node)}.`,
    )
  }

  if (!isValidElement(node)) {
    throw new WalkError(`Unsupported node in a template: ${describe(node)}.`)
  }

  const element = node as ReactElement<Props>
  const type: unknown = element.type

  const kind = hostKindOf(type)
  if (kind !== undefined) {
    found.push({ kind, props: element.props })
    return
  }

  if (type === Fragment) {
    visit(element.props['children'] as ReactNode, found)
    return
  }

  if (typeof type === 'function') {
    // The author's own component. Evaluated once, never rendered — no hooks,
    // no state, no reconciler (ADR-0001).
    const component = type as (props: Props) => ReactNode
    visit(component(element.props), found)
    return
  }

  throw new WalkError(
    'Only template components, your own components and Fragments are allowed inside a ' +
      `template — got ${describe(type)}.`,
  )
}

/**
 * Joins a body's parts into Meta's own text form, recording a slot for every
 * variable on the way past. A variable used twice writes `{{name}}` twice and
 * is merged into a single slot afterwards.
 */
function bodyText(children: unknown, slots: SlotIR[]): string {
  let text = ''

  for (const part of bodyParts(children)) {
    if (typeof part === 'string') {
      text += part
      continue
    }

    text += `{{${part.name}}}`
    slots.push({ name: part.name, component: 'body', example: part.example, prop: part.prop })
  }

  return text
}

function bodyParts(children: unknown): Array<string | SlotDeclaration> {
  const parts: Array<string | SlotDeclaration> = []
  visitPart(children, parts)
  return parts
}

function visitPart(part: unknown, parts: Array<string | SlotDeclaration>): void {
  if (Array.isArray(part)) {
    for (const child of part as unknown[]) visitPart(child, parts)
    return
  }

  if (typeof part === 'string') {
    parts.push(part)
    return
  }

  const declaration = slotDeclaration(part)
  if (declaration !== undefined) {
    parts.push(declaration)
    return
  }

  throw new WalkError(`<Body> takes text and variables — got ${describe(part)}.`)
}

/**
 * Merges repeated declarations of one variable. Two declarations are the same
 * variable when they agree on both the wire name and the prop, in which case
 * the surviving slot keeps the first declaration's position and the **last**
 * one's example — specified behaviour, not an accident (ADR-0007). Overwriting
 * a `Map` entry replaces the value and leaves its insertion order alone, which
 * is exactly that rule.
 *
 * Declarations that agree on only one of the two survive as separate slots.
 * That is how the validator comes to see a wire name shared by two props, or a
 * prop split across two wire names.
 */
function mergeSlots(slots: readonly SlotIR[]): SlotIR[] {
  const merged = new Map<string, SlotIR>()

  for (const slot of slots) {
    merged.set(`${typeof slot.name}:${slot.name} ${slot.prop}`, slot)
  }

  return [...merged.values()]
}

function stringProp(props: Props, name: string): string {
  const value = props[name]
  if (typeof value !== 'string') {
    throw new WalkError(`<Template> requires a ${name} prop — got ${describe(value)}.`)
  }
  return value
}

function describe(value: unknown): string {
  if (typeof value === 'string') return `<${value}>`

  const prop = propOf(value)
  if (prop !== undefined) {
    return `the prop "${prop}", which is only a variable once it is passed to variable()`
  }

  if (typeof value === 'object' && value !== null) return value.constructor?.name ?? 'object'
  return String(value)
}
