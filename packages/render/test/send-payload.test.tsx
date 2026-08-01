import { Body, Template } from '@react-whatsapp-templates/components'
import { toSendPayload, toTemplateMessage } from '@react-whatsapp-templates/render'
import { expect, test } from 'vitest'

function StoreClosure() {
  return (
    <Template name="store_closure" language="en_US" category="UTILITY">
      <Body>We are closed on Monday for a public holiday.</Body>
    </Template>
  )
}

/**
 * The send dialect: lowercase component types and a language object, as in
 * `docs/marketing-templates/custom-marketing-templates.md#step-2-send-a-custom-marketing-template`.
 * The sample recipient is that document's own.
 */
test('a static template compiles to the send payload Meta documents', async () => {
  const payload = await toSendPayload(<StoreClosure />, { to: '16505551234' })

  expect(JSON.stringify(payload, null, 2)).toMatchInlineSnapshot(`
    "{
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": "16505551234",
      "type": "template",
      "template": {
        "name": "store_closure",
        "language": {
          "code": "en_US"
        },
        "components": []
      }
    }"
  `)
})

test('the template message is the send payload without the recipient envelope', async () => {
  const payload = await toSendPayload(<StoreClosure />, { to: '16505551234' })
  const message = await toTemplateMessage(<StoreClosure />)

  expect(payload.template).toEqual(message)
})

test('a template with no slots sends no components', async () => {
  const message = await toTemplateMessage(<StoreClosure />)

  expect(message.components).toEqual([])
})
