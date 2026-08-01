import { hostKindOf, type HostKind } from '@react-whatsapp-templates/components'
import type {
  ComponentIR,
  LanguageCode,
  TemplateCategory,
  TemplateIR,
} from '@react-whatsapp-templates/core'
import { Fragment, isValidElement, type ReactElement, type ReactNode } from 'react'

/**
 * Thrown when a tree is not a template at all. Violations of Meta's rules are
 * diagnostics from the validator, not exceptions from the walker (ADR-0003).
 */
export class WalkError extends Error {
  override name = 'WalkError'
}

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
 */
export function walk(node: ReactNode): TemplateIR {
  const roots = collectHosts(node)
  const root = roots[0]

  if (roots.length !== 1 || root === undefined || root.kind !== 'template') {
    throw new WalkError('A template must evaluate to a single <Template> element.')
  }

  const components: ComponentIR[] = []

  for (const child of collectHosts(root.props['children'] as ReactNode)) {
    switch (child.kind) {
      case 'body':
        components.push({ kind: 'body', text: bodyText(child.props['children']) })
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
    slots: [],
  }
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

function bodyText(children: unknown): string {
  if (typeof children !== 'string') {
    throw new WalkError('<Body> takes a single string as its children.')
  }
  return children
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
  if (typeof value === 'object' && value !== null) return value.constructor?.name ?? 'object'
  return String(value)
}
