import type { Slot } from '@react-whatsapp-templates/core'
import type { ReactElement } from 'react'
import { markHost, unreachable } from './host'

/** A run of body text, or a variable standing in for one. */
export type BodyPart = string | Slot

export interface BodyProps {
  /**
   * Body text, written as text and variables. `<Body>` is the one component
   * that takes its text as children rather than as a prop — its
   * 1024-character cap was never checkable at the type level, so it gets the
   * nicer syntax (ADR-0002).
   *
   * Typed as parts rather than as `ReactNode`, so a stray `<Footer>` inside a
   * body is a compile error rather than a walker error (ADR-0007).
   */
  children: BodyPart | ReadonlyArray<BodyPart>
}

/** The core text of the template. Meta requires exactly one. */
export const Body = markHost(function Body(_props: BodyProps): ReactElement {
  return unreachable('Body')
}, 'body')
