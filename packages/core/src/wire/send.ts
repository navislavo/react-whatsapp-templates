import type { LanguageCode } from '../language'

/**
 * The inner `template` object of a send payload, without the recipient
 * envelope. What `toTemplateMessage` returns.
 *
 * This dialect uses **lowercase** component types, a language **object**,
 * `parameter_name`, and one component per button. It contains no rendered
 * text — only slot values.
 */
export interface TemplateMessage {
  readonly name: string
  readonly language: { readonly code: LanguageCode }
  readonly components: readonly SendComponent[]
}

/**
 * The JSON sending an approved template to a recipient —
 * `POST /{PHONE-NUMBER-ID}/messages`. See
 * `docs/marketing-templates/custom-marketing-templates.md`.
 */
export interface SendPayload {
  readonly messaging_product: 'whatsapp'
  readonly recipient_type: 'individual'
  readonly to: string
  readonly type: 'template'
  readonly template: TemplateMessage
}

/** Widened by later tickets with header and per-button components. */
export type SendComponent = SendBodyComponent

export interface SendBodyComponent {
  readonly type: 'body'
  readonly parameters: readonly SendParameter[]
}

/** Widened by later tickets with image, video, document and location. */
export type SendParameter = SendTextParameter | SendCurrencyParameter | SendDateTimeParameter

/**
 * `parameter_name` is present in named format and absent in positional, where
 * a parameter is identified by its position in the array
 * (`docs/overview.md#positional-parameters`).
 */
export interface SendTextParameter {
  readonly type: 'text'
  readonly parameter_name?: string
  readonly text: string
}

export interface SendCurrencyParameter {
  readonly type: 'currency'
  readonly parameter_name?: string
  readonly currency: CurrencyValue
}

export interface SendDateTimeParameter {
  readonly type: 'date_time'
  readonly parameter_name?: string
  readonly date_time: DateTimeValue
}

/** Meta's currency object, verbatim — `docs/template-media.md:91-96`. */
export interface CurrencyValue {
  readonly fallback_value: string
  readonly code: string
  readonly amount_1000: number
}

/** Meta's date-time object, verbatim — `docs/template-media.md:99-102`. */
export interface DateTimeValue {
  readonly fallback_value: string
}
