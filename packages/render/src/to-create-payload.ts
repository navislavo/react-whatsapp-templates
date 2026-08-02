import {
  parameterFormat,
  type ComponentIR,
  type CreateBodyExample,
  type CreateComponent,
  type CreateTemplatePayload,
  type ParameterFormat,
  type SlotIR,
  type TemplateIR,
} from '@react-whatsapp-templates/core'
import { assertValid } from '@react-whatsapp-templates/validate'
import type { CompileOptions } from './options'
import { walk, type AnyTemplate } from './walk'

/**
 * Compiles a template into the JSON that registers it with Meta —
 * `POST /{WABA-ID}/message_templates`.
 *
 * Shares nothing with the send compiler but the IR: the dialects differ down to
 * the casing of every component type.
 */
export async function toCreatePayload(
  template: AnyTemplate,
  _options: CompileOptions = {},
): Promise<CreateTemplatePayload> {
  return createPayloadFromIR(walk(template))
}

export function createPayloadFromIR(ir: TemplateIR): CreateTemplatePayload {
  assertValid(ir)

  const format = parameterFormat(ir.slots)

  return {
    name: ir.name,
    language: ir.language,
    category: ir.category,
    parameter_format: format,
    components: ir.components.map((component) => toCreateComponent(ir, component, format)),
  }
}

function toCreateComponent(
  ir: TemplateIR,
  component: ComponentIR,
  format: ParameterFormat,
): CreateComponent {
  switch (component.kind) {
    case 'body': {
      const slots = ir.slots.filter((slot) => slot.component === 'body')
      if (slots.length === 0) return { type: 'BODY', text: component.text }

      return { type: 'BODY', text: component.text, example: bodyExample(slots, format) }
    }
  }
}

/**
 * One example shape per format: an object per parameter when named, and a
 * single row of values when positional — `[[…]]`, nested exactly as
 * `docs/overview.md#positional-parameters` has it.
 */
function bodyExample(slots: readonly SlotIR[], format: ParameterFormat): CreateBodyExample {
  if (format === 'positional') {
    return { body_text: [slots.map((slot) => slot.example)] }
  }

  return {
    body_text_named_params: slots.map((slot) => ({
      param_name: String(slot.name),
      example: slot.example,
    })),
  }
}
