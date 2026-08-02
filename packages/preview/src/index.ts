import type { TemplateIR } from '@react-whatsapp-templates/core'
import { validate, type Diagnostic } from '@react-whatsapp-templates/validate'

/**
 * The preview server renders a template from the examples its variables were
 * declared with (ADR-0007) and shows the validator's diagnostics inline. Only
 * the diagnostics half exists yet; the server itself arrives with the preview
 * ticket.
 */
export interface PreviewModel {
  readonly ir: TemplateIR
  readonly diagnostics: readonly Diagnostic[]
}

export function toPreviewModel(ir: TemplateIR): PreviewModel {
  return { ir, diagnostics: validate(ir) }
}
