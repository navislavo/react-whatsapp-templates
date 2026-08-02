import { Body, Template } from '@react-whatsapp-templates/components'
import { WalkError, walk } from '@react-whatsapp-templates/render'
import type { ReactNode } from 'react'
import { expect, test } from 'vitest'

const ir = {
  name: 'store_closure',
  language: 'en_US',
  category: 'UTILITY',
  components: [{ kind: 'body', text: 'We are closed on Monday for a public holiday.' }],
  slots: [],
  props: [],
}

test('walks a template written directly', () => {
  const element = (
    <Template name="store_closure" language="en_US" category="UTILITY">
      <Body>We are closed on Monday for a public holiday.</Body>
    </Template>
  )

  expect(walk(element)).toEqual(ir)
})

test('evaluates through the author’s own function components', () => {
  function Closure({ children }: { children: ReactNode }) {
    return (
      <Template name="store_closure" language="en_US" category="UTILITY">
        {children}
      </Template>
    )
  }

  function ClosureBody() {
    return <Body>We are closed on Monday for a public holiday.</Body>
  }

  expect(
    walk(
      <Closure>
        <ClosureBody />
      </Closure>,
    ),
  ).toEqual(ir)
})

test('evaluates through Fragments', () => {
  const element = (
    <>
      <Template name="store_closure" language="en_US" category="UTILITY">
        <>
          <Body>We are closed on Monday for a public holiday.</Body>
        </>
      </Template>
    </>
  )

  expect(walk(element)).toEqual(ir)
})

test('skips nullish and boolean children', () => {
  const showFooterLater = false

  const element = (
    <Template name="store_closure" language="en_US" category="UTILITY">
      {null}
      <Body>We are closed on Monday for a public holiday.</Body>
      {showFooterLater && <Body>never</Body>}
    </Template>
  )

  expect(walk(element)).toEqual(ir)
})

test('rejects a tree that is not rooted in a template', () => {
  expect(() => walk(<Body>orphan</Body>)).toThrow(WalkError)
})

test('rejects a nested template', () => {
  const element = (
    <Template name="store_closure" language="en_US" category="UTILITY">
      <Template name="nested" language="en_US" category="UTILITY">
        <Body>nested</Body>
      </Template>
    </Template>
  )

  expect(() => walk(element)).toThrow(WalkError)
})

test('rejects loose text between components', () => {
  const element = (
    <Template name="store_closure" language="en_US" category="UTILITY">
      stray text
      <Body>We are closed on Monday for a public holiday.</Body>
    </Template>
  )

  expect(() => walk(element)).toThrow(WalkError)
})

test('rejects DOM elements', () => {
  const element = (
    <Template name="store_closure" language="en_US" category="UTILITY">
      <div />
    </Template>
  )

  expect(() => walk(element)).toThrow(WalkError)
})
