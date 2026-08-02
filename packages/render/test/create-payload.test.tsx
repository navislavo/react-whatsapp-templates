import { Body, Template } from '@react-whatsapp-templates/components'
import { variable, type Vars } from '@react-whatsapp-templates/core'
import { toCreatePayload } from '@react-whatsapp-templates/render'
import { expect, test } from 'vitest'

function StoreClosure() {
  return (
    <Template name="store_closure" language="en_US" category="UTILITY">
      <Body>We are closed on Monday for a public holiday.</Body>
    </Template>
  )
}

interface OrderProps {
  firstName: string
  orderNumber: string
}

/**
 * The named example from `docs/overview.md#named-parameters`, written as a
 * template. The one difference from the document is casing — it writes
 * `"category": "utility"` and `"type": "body"` where `docs/components.md`
 * writes both uppercase, and this project emits the create dialect uppercase
 * throughout (CONTEXT.md).
 */
function OrderConfirmationNamed({ firstName, orderNumber }: Vars<OrderProps>) {
  return (
    <Template name="order_confirmation" language="en_US" category="UTILITY">
      <Body>
        Thank you, {variable(firstName, { name: 'first_name', example: 'Pablo' })}! Your order
        number is {variable(orderNumber, { name: 'order_number', example: '860198-230332' })}.
      </Body>
    </Template>
  )
}

/** The positional example from `docs/overview.md#positional-parameters`. */
function OrderConfirmationPositional({ firstName, orderNumber }: Vars<OrderProps>) {
  return (
    <Template name="order_confirmation" language="en_US" category="UTILITY">
      <Body>
        Hi {variable(firstName, { name: 1, example: 'Pablo' })}! Your order number is{' '}
        {variable(orderNumber, { name: 2, example: '860198-230332' })}. Thank you.
      </Body>
    </Template>
  )
}

/**
 * The create dialect: uppercase component types and a bare language string, as
 * in the `Seasonal promotion` example request in `docs/components.md`.
 */
test('a static template compiles to the create payload Meta documents', async () => {
  const payload = await toCreatePayload(StoreClosure)

  expect(JSON.stringify(payload, null, 2)).toMatchInlineSnapshot(`
    "{
      "name": "store_closure",
      "language": "en_US",
      "category": "UTILITY",
      "parameter_format": "positional",
      "components": [
        {
          "type": "BODY",
          "text": "We are closed on Monday for a public holiday."
        }
      ]
    }"
  `)
})

test('named variables compile to the create payload Meta documents', async () => {
  const payload = await toCreatePayload(OrderConfirmationNamed)

  expect(JSON.stringify(payload, null, 2)).toMatchInlineSnapshot(`
    "{
      "name": "order_confirmation",
      "language": "en_US",
      "category": "UTILITY",
      "parameter_format": "named",
      "components": [
        {
          "type": "BODY",
          "text": "Thank you, {{first_name}}! Your order number is {{order_number}}.",
          "example": {
            "body_text_named_params": [
              {
                "param_name": "first_name",
                "example": "Pablo"
              },
              {
                "param_name": "order_number",
                "example": "860198-230332"
              }
            ]
          }
        }
      ]
    }"
  `)
})

test('positional variables compile to the create payload Meta documents', async () => {
  const payload = await toCreatePayload(OrderConfirmationPositional)

  expect(JSON.stringify(payload, null, 2)).toMatchInlineSnapshot(`
    "{
      "name": "order_confirmation",
      "language": "en_US",
      "category": "UTILITY",
      "parameter_format": "positional",
      "components": [
        {
          "type": "BODY",
          "text": "Hi {{1}}! Your order number is {{2}}. Thank you.",
          "example": {
            "body_text": [
              [
                "Pablo",
                "860198-230332"
              ]
            ]
          }
        }
      ]
    }"
  `)
})

test('an element still compiles, for a template with no props', async () => {
  const payload = await toCreatePayload(<StoreClosure />)

  expect(payload.components).toEqual([
    { type: 'BODY', text: 'We are closed on Monday for a public holiday.' },
  ])
})
