import type { TemplateCategory } from '../category'
import type { LanguageCode } from '../language'

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
  readonly components: readonly CreateComponent[]
}

/** Widened by later tickets with HEADER, FOOTER and BUTTONS. */
export type CreateComponent = CreateBodyComponent

export interface CreateBodyComponent {
  readonly type: 'BODY'
  readonly text: string
}
