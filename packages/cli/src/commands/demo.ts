import { toCreatePayload, toSendPayload, walk } from '@react-whatsapp-templates/render'
import type { SlotIR } from '@react-whatsapp-templates/core'
import { loadTemplate } from '../load-template'

/** The sample recipient from `docs/marketing-templates/custom-marketing-templates.md`. */
const SAMPLE_RECIPIENT = '16505551234'

export interface DemoOptions {
  readonly to?: string
}

/**
 * Prints both Meta payloads for a template — the JSON that would register it
 * and the JSON that would send it. Nothing is sent anywhere.
 *
 * Send values are the caller's, and a command line has none, so the demo sends
 * each variable's own example. Every example is by definition a valid value for
 * its variable, which is why the preview renders from them too (ADR-0007).
 */
export async function demo(
  file: string,
  options: DemoOptions = {},
  out: (line: string) => void = console.log,
): Promise<void> {
  const { component } = await loadTemplate(file)
  const values = exampleValues(walk(component).slots)

  const create = await toCreatePayload(component)
  const send = await toSendPayload(component, values, { to: options.to ?? SAMPLE_RECIPIENT })

  out(`# create payload — POST /{WABA-ID}/message_templates`)
  out(JSON.stringify(create, null, 2))
  out('')
  out(`# send payload — POST /{PHONE-NUMBER-ID}/messages`)
  out(JSON.stringify(send, null, 2))
}

function exampleValues(slots: readonly SlotIR[]): Record<string, string> {
  return Object.fromEntries(slots.map((slot) => [slot.prop, slot.example]))
}
