import type { TemplateCategory } from './category'
import type { LanguageCode } from './language'

/**
 * The normalized internal form of a template — the only thing the validator and
 * both compilers read, and therefore the reason the two payloads cannot drift
 * apart. Produced by the walker; never constructed by hand outside tests.
 */
export interface TemplateIR {
  readonly name: string
  readonly language: LanguageCode
  readonly category: TemplateCategory
  /** Meta components in authoring order. */
  readonly components: readonly ComponentIR[]
  /** Every position whose content is supplied at send time, in authored order. */
  readonly slots: readonly SlotIR[]
  /**
   * The props the component read while it was evaluated, in the order it read
   * them. A prop listed here that binds to no slot was never passed to
   * `variable()`, which is a diagnostic.
   */
  readonly props: readonly string[]
}

/** Widened by later tickets with header, footer and buttons. */
export type ComponentIR = BodyIR

export interface BodyIR {
  readonly kind: 'body'
  /** Body text in Meta's own form — `{{placeholder}}` where a slot appears. */
  readonly text: string
}

/**
 * One variable. Repeated declarations of a single name for a single prop merge
 * into one entry — positioned at the first declaration, carrying the example
 * from the last (ADR-0007) — so two entries sharing a name, or sharing a prop,
 * are exactly the collisions the validator reports.
 */
export interface SlotIR {
  /** The identifier Meta sees. A string is named format, a number positional. */
  readonly name: string | number
  /** Which component the slot sits in, so each compiler can group by component. */
  readonly component: ComponentIR['kind']
  /** The example value Meta requires at registration. */
  readonly example: string
  /** The prop whose send-time value fills this slot. */
  readonly prop: string
}
