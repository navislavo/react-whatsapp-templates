import type { TemplateCategory } from '../category'
import type { LanguageCode } from '../language'
import type { ParameterFormat } from '../parameter-format'

/**
 * The JSON registering a template with Meta —
 * `POST /{WABA-ID}/message_templates`.
 *
 * This dialect uses **uppercase** component types, a **bare** language string
 * and `param_name`. See `docs/components.md` and
 * `docs/marketing-templates/custom-marketing-templates.md`.
 */
export interface CreateTemplatePayload {
  readonly name: string
  readonly language: LanguageCode
  readonly category: TemplateCategory
  /** Derived from the wire names used, and always present (ADR-0007). */
  readonly parameter_format: ParameterFormat
  readonly components: readonly CreateComponent[]
}

/** Widened by later tickets with HEADER, FOOTER and BUTTONS. */
export type CreateComponent = CreateBodyComponent

export interface CreateBodyComponent {
  readonly type: 'BODY'
  readonly text: string
  /** Omitted entirely when the body has no variables. */
  readonly example?: CreateBodyExample
}

/**
 * One example shape per parameter format. Named parameters are listed one
 * object per parameter; positional ones are a single row of values —
 * `string[][]`, nested exactly as `docs/overview.md#positional-parameters` has
 * it.
 */
export type CreateBodyExample =
  | { readonly body_text_named_params: readonly CreateNamedParamExample[] }
  | { readonly body_text: readonly (readonly string[])[] }

export interface CreateNamedParamExample {
  readonly param_name: string
  readonly example: string
}
