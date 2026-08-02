import {
  parameterFormat,
  type ComponentIR,
  type SendComponent,
  type SendCurrencyParameter,
  type SendDateTimeParameter,
  type SendParameter,
  type SendPayload,
  type SlotIR,
  type TemplateIR,
  type TemplateMessage,
} from '@react-whatsapp-templates/core'
import { assertValid } from '@react-whatsapp-templates/validate'
import type { CompileOptions } from './options'
import { walk, type AnyTemplate, type PropsOf } from './walk'

/**
 * What a slot can be filled with at send time: text, or one of the two
 * non-text parameters, which arrive as the objects `currency()` and
 * `dateTime()` return.
 */
export type SlotValue = string | number | boolean | SendCurrencyParameter | SendDateTimeParameter

/** The values a template is sent with, keyed by **prop** — never by wire name. */
export type SlotValues = Readonly<Record<string, SlotValue>>

export interface SendPayloadOptions extends CompileOptions {
  /** The recipient's WhatsApp phone number. */
  readonly to: string
}

/**
 * Compiles a template into the inner `template` object of a send payload.
 *
 * Carries no rendered text — only parameter values — which is why one
 * evaluation of the component is enough (ADR-0001). The values are the
 * template's own props, unwrapped: real values, not tokens.
 */
export async function toTemplateMessage<T extends AnyTemplate>(
  template: T,
  values: PropsOf<T>,
  _options: CompileOptions = {},
): Promise<TemplateMessage> {
  return templateMessageFromIR(walk(template), values as SlotValues)
}

/**
 * Compiles a template into the JSON that sends it to a recipient —
 * `POST /{PHONE-NUMBER-ID}/messages`. A thin envelope over
 * {@link toTemplateMessage}: the recipient appears here and nowhere else.
 */
export async function toSendPayload<T extends AnyTemplate>(
  template: T,
  values: PropsOf<T>,
  options: SendPayloadOptions,
): Promise<SendPayload> {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: options.to,
    type: 'template',
    template: await toTemplateMessage(template, values, options),
  }
}

export function templateMessageFromIR(ir: TemplateIR, values: SlotValues): TemplateMessage {
  assertValid(ir)

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
  component: ComponentIR,
  values: SlotValues,
): SendComponent[] {
  switch (component.kind) {
    case 'body': {
      // Positional parameters are identified by their place in this array, so
      // slot order — the order the placeholders appear in — is load-bearing.
      const named = parameterFormat(ir.slots) === 'named'
      const parameters = ir.slots
        .filter((slot) => slot.component === 'body')
        .map((slot) => toParameter(slot, values, named))

      return parameters.length === 0 ? [] : [{ type: 'body', parameters }]
    }
  }
}

function toParameter(slot: SlotIR, values: SlotValues, named: boolean): SendParameter {
  const value = values[slot.prop]
  if (value === undefined) {
    throw new Error(
      `No value was supplied for {{${slot.name}}} — pass one as "${slot.prop}", the prop it is ` +
        'declared from.',
    )
  }

  const parameter = toParameterValue(slot, value)
  if (!named) return parameter

  const parameter_name = String(slot.name)
  switch (parameter.type) {
    case 'text':
      return { type: 'text', parameter_name, text: parameter.text }
    case 'currency':
      return { type: 'currency', parameter_name, currency: parameter.currency }
    case 'date_time':
      return { type: 'date_time', parameter_name, date_time: parameter.date_time }
  }
}

/**
 * `currency()` and `dateTime()` produce Meta's parameter objects already, so
 * they pass straight through; everything else is text.
 */
function toParameterValue(slot: SlotIR, value: SlotValue): SendParameter {
  if (typeof value === 'object' && value !== null) {
    if (value.type === 'currency' || value.type === 'date_time') return value

    throw new TypeError(
      `The value for {{${slot.name}}} must be text, or the result of currency() or dateTime().`,
    )
  }

  return { type: 'text', text: String(value) }
}
