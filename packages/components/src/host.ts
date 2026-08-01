/**
 * Host components are our JSX elements that map onto a Meta component. The
 * walker recognises them by this marker rather than by identity, so a template
 * still compiles when two copies of the package end up in one dependency tree.
 */
export const HOST_KIND: unique symbol = Symbol.for('react-whatsapp-templates.host')

export type HostKind = 'template' | 'body'

export interface HostMarker {
  readonly [HOST_KIND]: HostKind
}

/**
 * Host components are never invoked — the walker intercepts them. Reaching one
 * at runtime means the tree went through a React renderer instead.
 */
export function unreachable(name: string): never {
  throw new Error(
    `<${name}> was rendered by React. Templates are compiled by the walker in ` +
      `@react-whatsapp-templates/render, not rendered by react-dom.`,
  )
}

export function markHost<T extends object>(component: T, kind: HostKind): T & HostMarker {
  return Object.assign(component, { [HOST_KIND]: kind } as const)
}

export function hostKindOf(type: unknown): HostKind | undefined {
  if (typeof type !== 'function' && typeof type !== 'object') return undefined
  if (type === null) return undefined
  const kind = (type as Partial<HostMarker>)[HOST_KIND]
  return kind === 'template' || kind === 'body' ? kind : undefined
}
