/**
 * Compile-time coverage for the field rules TypeScript can reach (ADR-0003).
 * These files are never executed — `tsc --noEmit` failing here *is* the test,
 * and a `@ts-expect-error` that stops erroring fails the build too.
 */
import { Body, Template } from 'react-whatsapp-templates'

export const valid = (
  <Template name="store_closure" language="en_US" category="UTILITY">
    <Body>We are closed on Monday for a public holiday.</Body>
  </Template>
)

export const invalidName = (
  <Template
    // @ts-expect-error — a template name must match ^[a-z0-9_]+$
    name="Order Shipped"
    language="en_US"
    category="UTILITY"
  >
    <Body>Your order has shipped.</Body>
  </Template>
)

/**
 * The 512-character boundary, built by doubling rather than by pasting 512
 * characters into the source. `Double` applied nine times is 2⁹ = 512.
 */
type Double<S extends string> = `${S}${S}`
type Name512 = Double<Double<Double<Double<Double<Double<Double<Double<Double<'a'>>>>>>>>>

declare const name512: Name512
declare const name513: `${Name512}a`

export const validMaxLengthName = (
  <Template name={name512} language="en_US" category="UTILITY">
    <Body>Your order has shipped.</Body>
  </Template>
)

export const invalidTooLongName = (
  <Template
    // @ts-expect-error — a template name may be at most 512 characters
    name={name513}
    language="en_US"
    category="UTILITY"
  >
    <Body>Your order has shipped.</Body>
  </Template>
)

export const invalidEmptyName = (
  <Template
    // @ts-expect-error — a template name must not be empty
    name=""
    language="en_US"
    category="UTILITY"
  >
    <Body>Your order has shipped.</Body>
  </Template>
)

export const invalidLanguage = (
  <Template
    name="order_shipped"
    // @ts-expect-error — "en-US" is not one of Meta's supported language codes
    language="en-US"
    category="UTILITY"
  >
    <Body>Your order has shipped.</Body>
  </Template>
)

export const invalidCategory = (
  <Template
    name="order_shipped"
    language="en_US"
    // @ts-expect-error — PROMOTIONAL is not one of Meta's three categories
    category="PROMOTIONAL"
  >
    <Body>Your order has shipped.</Body>
  </Template>
)
