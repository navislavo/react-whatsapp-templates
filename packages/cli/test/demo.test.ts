import { fileURLToPath } from 'node:url'
import { demo } from '@react-whatsapp-templates/cli'
import { expect, test } from 'vitest'

const template = fileURLToPath(
  new URL('../../../examples/basic/templates/store-closure.tsx', import.meta.url),
)

test('demo prints both payloads for the example template', async () => {
  const lines: string[] = []

  await demo(template, { to: '16505551234' }, (line) => lines.push(line))

  const output = lines.join('\n')

  expect(output).toContain('# create payload — POST /{WABA-ID}/message_templates')
  expect(output).toContain('"type": "BODY"')
  expect(output).toContain('# send payload — POST /{PHONE-NUMBER-ID}/messages')
  expect(output).toContain('"code": "en_US"')
  expect(output).toContain('"to": "16505551234"')
}, 30_000)
