import type { ReactElement } from 'react'
import { markHost, unreachable } from './host'

export interface BodyProps {
  /**
   * Body text. `<Body>` is the one component that takes its text as children
   * rather than as a prop — its 1024-character cap was never checkable at the
   * type level, so it gets the nicer syntax (ADR-0002).
   */
  children: string
}

/** The core text of the template. Meta requires exactly one. */
export const Body = markHost(function Body(_props: BodyProps): ReactElement {
  return unreachable('Body')
}, 'body')
