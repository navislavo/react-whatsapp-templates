import { Body, Template } from '@react-whatsapp-templates/components'
import { variable, type Var, type Vars } from '@react-whatsapp-templates/core'
import { WalkError, walk } from '@react-whatsapp-templates/render'
import { expect, test } from 'vitest'

/**
 * The type system rejects most of what follows — that coverage lives in
 * `type-tests/`. These tests are the runtime half: what a JavaScript caller, or
 * a cast, still reaches.
 */

interface OrderProps {
  firstName: string
  orderId: string
}

function OrderShipped({ firstName, orderId }: Vars<OrderProps>) {
  const order = variable(orderId, { name: 'order_id', example: '860198-230332' })

  return (
    <Template name="order_shipped" language="en_US" category="UTILITY">
      <Body>
        Hi {variable(firstName, { name: 'first_name', example: 'Pablo' })}, your order {order} has
        shipped.
      </Body>
    </Template>
  )
}

test('a declared variable becomes Meta’s placeholder and an ordered slot', () => {
  const ir = walk(OrderShipped)

  expect(ir.components).toEqual([
    { kind: 'body', text: 'Hi {{first_name}}, your order {{order_id}} has shipped.' },
  ])
  expect(ir.slots).toEqual([
    { name: 'first_name', component: 'body', example: 'Pablo', prop: 'firstName' },
    { name: 'order_id', component: 'body', example: '860198-230332', prop: 'orderId' },
  ])
  expect(ir.props).toEqual(['firstName', 'orderId'])
})

test('a variable used twice is written twice and declared once', () => {
  function Repeated({ orderId }: Vars<{ orderId: string }>) {
    const order = variable(orderId, { name: 'order_id', example: '860198-230332' })

    return (
      <Template name="order_shipped" language="en_US" category="UTILITY">
        <Body>Order {order} has shipped. Track it with {order}.</Body>
      </Template>
    )
  }

  const ir = walk(Repeated)

  expect(ir.components).toEqual([
    { kind: 'body', text: 'Order {{order_id}} has shipped. Track it with {{order_id}}.' },
  ])
  expect(ir.slots).toEqual([
    { name: 'order_id', component: 'body', example: '860198-230332', prop: 'orderId' },
  ])
})

/**
 * Specified behaviour rather than an accident: every example is a valid value
 * for its variable, so the last declaration in authored order wins, and the
 * merged slot keeps the first one's position (ADR-0007).
 */
test('a diverging example resolves to the last declaration in authored order', () => {
  function Diverging({ orderId, firstName }: Vars<OrderProps>) {
    return (
      <Template name="order_shipped" language="en_US" category="UTILITY">
        <Body>
          {variable(orderId, { name: 'order_id', example: 'first' })} for{' '}
          {variable(firstName, { name: 'first_name', example: 'Pablo' })}, also{' '}
          {variable(orderId, { name: 'order_id', example: 'last' })}.
        </Body>
      </Template>
    )
  }

  expect(walk(Diverging).slots.map((slot) => [slot.name, slot.example])).toEqual([
    ['order_id', 'last'],
    ['first_name', 'Pablo'],
  ])
})

test('positional names are written as {{1}}, {{2}}', () => {
  function Positional({ firstName, orderId }: Vars<OrderProps>) {
    return (
      <Template name="order_shipped" language="en_US" category="UTILITY">
        <Body>
          Hi {variable(firstName, { name: 1, example: 'Pablo' })}, your order{' '}
          {variable(orderId, { name: 2, example: '860198-230332' })} has shipped.
        </Body>
      </Template>
    )
  }

  const ir = walk(Positional)

  expect(ir.components).toEqual([{ kind: 'body', text: 'Hi {{1}}, your order {{2}} has shipped.' }])
  expect(ir.slots.map((slot) => slot.name)).toEqual([1, 2])
})

test('a prop the template reads is recorded even when it is never declared', () => {
  function Undeclared({ firstName, orderId: _orderId }: Vars<OrderProps>) {
    return (
      <Template name="order_shipped" language="en_US" category="UTILITY">
        <Body>Hi {variable(firstName, { name: 'first_name', example: 'Pablo' })}.</Body>
      </Template>
    )
  }

  const ir = walk(Undeclared)

  expect(ir.props).toEqual(['firstName', 'orderId'])
  expect(ir.slots.map((slot) => slot.prop)).toEqual(['firstName'])
})

test('a bare token in a body is rejected, and named', () => {
  function Bare({ firstName }: Vars<{ firstName: string }>) {
    return (
      <Template name="order_shipped" language="en_US" category="UTILITY">
        <Body>Hi {firstName as unknown as string}.</Body>
      </Template>
    )
  }

  expect(() => walk(Bare)).toThrow(/the prop "firstName"/)
})

test('a token throws rather than stringifying', () => {
  function Interpolated({ firstName }: Vars<{ firstName: string }>) {
    return (
      <Template name="order_shipped" language="en_US" category="UTILITY">
        <Body>{`Hi ${firstName}.`}</Body>
      </Template>
    )
  }

  expect(() => walk(Interpolated)).toThrow(/variable\(firstName/)
})

test('a declared variable throws rather than stringifying', () => {
  function Interpolated({ firstName }: Vars<{ firstName: string }>) {
    const name = variable(firstName, { name: 'first_name', example: 'Pablo' })

    return (
      <Template name="order_shipped" language="en_US" category="UTILITY">
        <Body>{`Hi ${name}.`}</Body>
      </Template>
    )
  }

  expect(() => walk(Interpolated)).toThrow(/\{\{first_name\}\} cannot be turned into text/)
})

test('variable() takes a prop, not a value', () => {
  const notAToken = 'Pablo' as unknown as Var<string>

  expect(() => variable(notAToken, { name: 'first_name', example: 'Pablo' })).toThrow(TypeError)
})

test('a template with no props walks as it always did', () => {
  function StoreClosure() {
    return (
      <Template name="store_closure" language="en_US" category="UTILITY">
        <Body>We are closed on Monday for a public holiday.</Body>
      </Template>
    )
  }

  const ir = walk(StoreClosure)

  expect(ir.slots).toEqual([])
  expect(ir.props).toEqual([])
})

test('a host component passed where a template belongs is a walk error', () => {
  expect(() => walk(Template)).toThrow(WalkError)
})

test('a foreign node in a body is a walk error', () => {
  const nested = <Body>nested</Body> as unknown as string

  const element = (
    <Template name="store_closure" language="en_US" category="UTILITY">
      <Body>{nested}</Body>
    </Template>
  )

  expect(() => walk(element)).toThrow(WalkError)
})
