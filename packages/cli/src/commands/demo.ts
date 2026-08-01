import { toCreatePayload, toSendPayload } from '@react-whatsapp-templates/render'
import { createElement } from 'react'
import { loadTemplate } from '../load-template'

/** The sample recipient from `docs/marketing-templates/custom-marketing-templates.md`. */
const SAMPLE_RECIPIENT = '16505551234'

export interface DemoOptions {
  readonly to?: string
}

/**
 * Prints both Meta payloads for a template — the JSON that would register it
 * and the JSON that would send it. Nothing is sent anywhere.
 */
export async function demo(
  file: string,
  options: DemoOptions = {},
  out: (line: string) => void = console.log,
): Promise<void> {
  const { component } = await loadTemplate(file)
  const element = createElement(component, {})

  const create = await toCreatePayload(element)
  const send = await toSendPayload(element, { to: options.to ?? SAMPLE_RECIPIENT })

  out(`# create payload — POST /{WABA-ID}/message_templates`)
  out(JSON.stringify(create, null, 2))
  out('')
  out(`# send payload — POST /{PHONE-NUMBER-ID}/messages`)
  out(JSON.stringify(send, null, 2))
}
