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
export type SendParameter = SendTextParameter

export interface SendTextParameter {
  readonly type: 'text'
  readonly parameter_name: string
  readonly text: string
}
