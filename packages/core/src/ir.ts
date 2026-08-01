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
  /** Every position whose content is supplied at send time. Empty until slots exist. */
  readonly slots: readonly SlotIR[]
}

/** Widened by later tickets with header, footer and buttons. */
export type ComponentIR = BodyIR

export interface BodyIR {
  readonly kind: 'body'
  /** Body text in Meta's own form — `{{placeholder}}` where a slot appears. */
  readonly text: string
}

export interface SlotIR {
  readonly name: string
  /** Which component the slot sits in, so each compiler can group by component. */
  readonly component: ComponentIR['kind']
  /** The example value Meta requires at registration. */
  readonly example: string
}
