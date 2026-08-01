import type {
  SendComponent,
  SendParameter,
  SendPayload,
  TemplateIR,
  TemplateMessage,
} from '@react-whatsapp-templates/core'
import type { ReactNode } from 'react'
import type { CompileOptions } from './options'
import { walk } from './walk'

/** The value supplied for each slot at send time. Keyed by slot name. */
export type SlotValues = Readonly<Record<string, string>>

export interface TemplateMessageOptions extends CompileOptions {
  readonly values?: SlotValues
}

export interface SendPayloadOptions extends TemplateMessageOptions {
  /** The recipient's WhatsApp phone number. */
  readonly to: string
}

/**
 * Compiles a template into the inner `template` object of a send payload.
 *
 * Carries no rendered text — only slot values — which is why one evaluation of
 * the component is enough (ADR-0001).
 */
export async function toTemplateMessage(
  template: ReactNode,
  options: TemplateMessageOptions = {},
): Promise<TemplateMessage> {
  return templateMessageFromIR(walk(template), options.values ?? {})
}

/**
 * Compiles a template into the JSON that sends it to a recipient —
 * `POST /{PHONE-NUMBER-ID}/messages`.
 */
export async function toSendPayload(
  template: ReactNode,
  options: SendPayloadOptions,
): Promise<SendPayload> {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: options.to,
    type: 'template',
    template: await toTemplateMessage(template, options),
  }
}

export function templateMessageFromIR(ir: TemplateIR, values: SlotValues): TemplateMessage {
  return {
    name: ir.name,
    language: { code: ir.language },
    components: ir.components.flatMap((component) => toSendComponent(ir, component, values)),
  }
}

/**
 * A component with no slots carries nothing at send time, so it produces no
 * component at all — the send payload is values, not structure.
 */
function toSendComponent(
  ir: TemplateIR,
  component: TemplateIR['components'][number],
  values: SlotValues,
): SendComponent[] {
  switch (component.kind) {
    case 'body': {
      const parameters = ir.slots
        .filter((slot) => slot.component === 'body')
        .map((slot): SendParameter => {
          const value = values[slot.name]
          if (value === undefined) {
            throw new Error(`No value was supplied for the slot {{${slot.name}}}.`)
          }
          return { type: 'text', parameter_name: slot.name, text: value }
        })

      return parameters.length === 0 ? [] : [{ type: 'body', parameters }]
    }
  }
}
