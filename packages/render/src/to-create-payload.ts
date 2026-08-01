import type {
  CreateComponent,
  CreateTemplatePayload,
  TemplateIR,
} from '@react-whatsapp-templates/core'
import type { ReactNode } from 'react'
import type { CompileOptions } from './options'
import { walk } from './walk'

/**
 * Compiles a template into the JSON that registers it with Meta —
 * `POST /{WABA-ID}/message_templates`.
 *
 * Shares nothing with the send compiler but the IR: the dialects differ down to
 * the casing of every component type.
 */
export async function toCreatePayload(
  template: ReactNode,
  _options: CompileOptions = {},
): Promise<CreateTemplatePayload> {
  return createPayloadFromIR(walk(template))
}

export function createPayloadFromIR(ir: TemplateIR): CreateTemplatePayload {
  return {
    name: ir.name,
    language: ir.language,
    category: ir.category,
    components: ir.components.map(toCreateComponent),
  }
}

function toCreateComponent(component: TemplateIR['components'][number]): CreateComponent {
  switch (component.kind) {
    case 'body':
      return { type: 'BODY', text: component.text }
  }
}
