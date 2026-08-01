import type { TemplateIR } from '@react-whatsapp-templates/core'
import { validate, type Diagnostic } from '@react-whatsapp-templates/validate'

/**
 * The preview server renders a template from its `ExampleProps` and shows the
 * validator's diagnostics inline. Only the diagnostics half exists at the
 * walking skeleton; the server itself arrives with the preview ticket.
 */
export interface PreviewModel {
  readonly ir: TemplateIR
  readonly diagnostics: readonly Diagnostic[]
}

export function toPreviewModel(ir: TemplateIR): PreviewModel {
  return { ir, diagnostics: validate(ir) }
}
