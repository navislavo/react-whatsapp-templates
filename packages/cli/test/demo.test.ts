import { fileURLToPath } from 'node:url'
import { demo } from '@react-whatsapp-templates/cli'
import { expect, test } from 'vitest'

const example = (name: string) =>
  fileURLToPath(new URL(`../../../examples/basic/templates/${name}.tsx`, import.meta.url))

async function run(file: string): Promise<string> {
  const lines: string[] = []
  await demo(file, { to: '16505551234' }, (line) => lines.push(line))
  return lines.join('\n')
}

test('demo prints both payloads for the example template', async () => {
  const output = await run(example('store-closure'))

  expect(output).toContain('# create payload — POST /{WABA-ID}/message_templates')
  expect(output).toContain('"type": "BODY"')
  expect(output).toContain('# send payload — POST /{PHONE-NUMBER-ID}/messages')
  expect(output).toContain('"code": "en_US"')
  expect(output).toContain('"to": "16505551234"')
}, 30_000)

/** A command line has no send values, so the demo sends each variable's example. */
test('demo fills a template’s variables from their own examples', async () => {
  const output = await run(example('order-shipped'))

  expect(output).toContain('"parameter_format": "named"')
  expect(output).toContain('"text": "Hi {{first_name}}, your order {{order_id}} has shipped.')
  expect(output).toContain('"param_name": "order_id"')
  expect(output).toContain('"parameter_name": "first_name"')
  expect(output).toContain('"text": "Pablo"')
}, 30_000)
