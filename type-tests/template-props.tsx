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
