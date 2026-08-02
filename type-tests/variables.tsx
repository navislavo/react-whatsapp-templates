/**
 * Compile-time coverage for variables (ADR-0007). Never executed — `tsc
 * --noEmit` failing here *is* the test, and a `@ts-expect-error` that stops
 * erroring fails the build too.
 */
import {
  Body,
  Template,
  toSendPayload,
  toTemplateMessage,
  variable,
  type Vars,
} from 'react-whatsapp-templates'

interface Props {
  firstName: string
  orderId: string
}

export default function OrderShipped({ firstName, orderId }: Vars<Props>) {
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

export const positionalNames = ({ firstName }: Vars<Props>) => (
  <Template name="order_shipped" language="en_US" category="UTILITY">
    <Body>Hi {variable(firstName, { name: 1, example: 'Pablo' })}.</Body>
  </Template>
)

/** A token is inert: it is a variable only once `variable()` has seen it. */
export const bareToken = ({ firstName }: Vars<Props>) => (
  <Template name="order_shipped" language="en_US" category="UTILITY">
    {/* @ts-expect-error — a Var is not a body part */}
    <Body>Hi {firstName}.</Body>
  </Template>
)

export const foreignElementInBody = (
  <Template name="order_shipped" language="en_US" category="UTILITY">
    <Body>
      {/* @ts-expect-error — <Body> takes text and variables, never elements */}
      <Body>nested</Body>
    </Body>
  </Template>
)

export const camelCaseName = ({ firstName }: Vars<Props>) =>
  // @ts-expect-error — a wire name must match ^[a-z0-9_]+$
  variable(firstName, { name: 'firstName', example: 'Pablo' })

export const hyphenatedName = ({ firstName }: Vars<Props>) =>
  // @ts-expect-error — a wire name must match ^[a-z0-9_]+$
  variable(firstName, { name: 'first-name', example: 'Pablo' })

export const emptyName = ({ firstName }: Vars<Props>) =>
  // @ts-expect-error — a wire name must not be empty
  variable(firstName, { name: '', example: 'Pablo' })

export const zeroName = ({ firstName }: Vars<Props>) =>
  // @ts-expect-error — positional names count from 1
  variable(firstName, { name: 0, example: 'Pablo' })

export const fractionalName = ({ firstName }: Vars<Props>) =>
  // @ts-expect-error — a positional name must be a whole number
  variable(firstName, { name: 1.5, example: 'Pablo' })

export const missingExample = ({ firstName }: Vars<Props>) =>
  // @ts-expect-error — Meta requires an example for every parameter
  variable(firstName, { name: 'first_name' })

export const sendValues = toSendPayload(
  OrderShipped,
  { firstName: 'Jessica', orderId: 'SKBUP2-4CPIG9' },
  { to: '16505551234' },
)

export const missingValue = toSendPayload(
  OrderShipped,
  // @ts-expect-error — every prop must be supplied at send time
  { firstName: 'Jessica' },
  { to: '16505551234' },
)

export const unknownValue = toTemplateMessage(OrderShipped, {
  firstName: 'Jessica',
  orderId: 'SKBUP2-4CPIG9',
  // @ts-expect-error — the template has no such prop
  trackingUrl: 'https://acme.example/t/SKBUP2',
})

/** Send values are the props themselves — real values, never tokens. */
export const tokenAsValue = ({ firstName }: Vars<Props>) =>
  toTemplateMessage(OrderShipped, {
    // @ts-expect-error — a token is not a value
    firstName,
    orderId: 'SKBUP2-4CPIG9',
  })
