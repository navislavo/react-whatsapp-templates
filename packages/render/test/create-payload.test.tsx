import { Body, Template } from '@react-whatsapp-templates/components'
import { toCreatePayload } from '@react-whatsapp-templates/render'
import { expect, test } from 'vitest'

function StoreClosure() {
  return (
    <Template name="store_closure" language="en_US" category="UTILITY">
      <Body>We are closed on Monday for a public holiday.</Body>
    </Template>
  )
}

/**
 * The create dialect: uppercase component types and a bare language string, as
 * in the `Seasonal promotion` example request in `docs/components.md`.
 */
test('a static template compiles to the create payload Meta documents', async () => {
  const payload = await toCreatePayload(<StoreClosure />)

  expect(JSON.stringify(payload, null, 2)).toMatchInlineSnapshot(`
    "{
      "name": "store_closure",
      "language": "en_US",
      "category": "UTILITY",
      "components": [
        {
          "type": "BODY",
          "text": "We are closed on Monday for a public holiday."
        }
      ]
    }"
  `)
})
