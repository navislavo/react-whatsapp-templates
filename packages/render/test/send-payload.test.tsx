import { Body, Template } from '@react-whatsapp-templates/components'
import {
  currency,
  dateTime,
  variable,
  type SendCurrencyParameter,
  type SendDateTimeParameter,
  type Vars,
} from '@react-whatsapp-templates/core'
import { toSendPayload, toTemplateMessage } from '@react-whatsapp-templates/render'
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

const values: OrderProps = { firstName: 'Jessica', orderNumber: 'SKBUP2-4CPIG9' }

/**
 * The send dialect: lowercase component types and a language object, as in
 * `docs/marketing-templates/custom-marketing-templates.md#step-2-send-a-custom-marketing-template`.
 * The sample recipient is that document's own.
 */
test('a static template compiles to the send payload Meta documents', async () => {
  const payload = await toSendPayload(StoreClosure, {}, { to: '16505551234' })

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

/** The named send payload in `docs/overview.md#named-parameters`, verbatim. */
test('named variables compile to the send payload Meta documents', async () => {
  const payload = await toSendPayload(OrderConfirmationNamed, values, { to: '+16505551234' })

  expect(JSON.stringify(payload, null, 2)).toMatchInlineSnapshot(`
    "{
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": "+16505551234",
      "type": "template",
      "template": {
        "name": "order_confirmation",
        "language": {
          "code": "en_US"
        },
        "components": [
          {
            "type": "body",
            "parameters": [
              {
                "type": "text",
                "parameter_name": "first_name",
                "text": "Jessica"
              },
              {
                "type": "text",
                "parameter_name": "order_number",
                "text": "SKBUP2-4CPIG9"
              }
            ]
          }
        ]
      }
    }"
  `)
})

/**
 * The positional send payload in `docs/overview.md#positional-parameters`,
 * verbatim — `parameter_name` is absent entirely, since a positional parameter
 * is identified by its place in the array.
 */
test('positional variables compile to the send payload Meta documents', async () => {
  const payload = await toSendPayload(OrderConfirmationPositional, values, { to: '+16505551234' })

  expect(JSON.stringify(payload, null, 2)).toMatchInlineSnapshot(`
    "{
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": "+16505551234",
      "type": "template",
      "template": {
        "name": "order_confirmation",
        "language": {
          "code": "en_US"
        },
        "components": [
          {
            "type": "body",
            "parameters": [
              {
                "type": "text",
                "text": "Jessica"
              },
              {
                "type": "text",
                "text": "SKBUP2-4CPIG9"
              }
            ]
          }
        ]
      }
    }"
  `)
})

test('the template message is the send payload without the recipient envelope', async () => {
  const payload = await toSendPayload(OrderConfirmationNamed, values, { to: '16505551234' })
  const message = await toTemplateMessage(OrderConfirmationNamed, values)

  expect(payload.template).toEqual(message)
})

test('a template with no slots sends no components', async () => {
  const message = await toTemplateMessage(StoreClosure, {})

  expect(message.components).toEqual([])
})

test('a missing value names the prop it should have come from', async () => {
  const incomplete = { firstName: 'Jessica' } as OrderProps

  await expect(toTemplateMessage(OrderConfirmationNamed, incomplete)).rejects.toThrow(
    /pass one as "orderNumber"/,
  )
})

test('a prop that is not text is sent as text', async () => {
  function Balance({ points }: Vars<{ points: number }>) {
    return (
      <Template name="balance" language="en_US" category="UTILITY">
        <Body>You have {variable(points, { name: 'points', example: '250' })} points.</Body>
      </Template>
    )
  }

  const message = await toTemplateMessage(Balance, { points: 250 })

  expect(message.components).toEqual([
    { type: 'body', parameters: [{ type: 'text', parameter_name: 'points', text: '250' }] },
  ])
})

/**
 * `currency()` and `dateTime()` produce Meta's parameter objects verbatim —
 * `amount_1000` is the caller's number, never a multiplication of ours
 * (`docs/template-media.md:91-102` documents no multiplier).
 */
test('non-text parameters pass through with only the name added', async () => {
  interface ReceiptProps {
    total: SendCurrencyParameter
    paidAt: SendDateTimeParameter
  }

  function Receipt({ total, paidAt }: Vars<ReceiptProps>) {
    return (
      <Template name="receipt" language="en_US" category="UTILITY">
        <Body>
          You paid {variable(total, { name: 'total', example: '$100.99' })} on{' '}
          {variable(paidAt, { name: 'paid_at', example: 'February 25, 1977' })}.
        </Body>
      </Template>
    )
  }

  const message = await toTemplateMessage(Receipt, {
    total: currency({ fallback_value: '$100.99', code: 'USD', amount_1000: 100990 }),
    paidAt: dateTime({ fallback_value: 'February 25, 1977' }),
  })

  expect(message.components).toEqual([
    {
      type: 'body',
      parameters: [
        {
          type: 'currency',
          parameter_name: 'total',
          currency: { fallback_value: '$100.99', code: 'USD', amount_1000: 100990 },
        },
        {
          type: 'date_time',
          parameter_name: 'paid_at',
          date_time: { fallback_value: 'February 25, 1977' },
        },
      ],
    },
  ])
})
