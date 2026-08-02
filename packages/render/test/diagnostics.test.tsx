import { Body, Template } from '@react-whatsapp-templates/components'
import { variable, type Vars } from '@react-whatsapp-templates/core'
import { toCreatePayload, walk, type AnyTemplate } from '@react-whatsapp-templates/render'
import { DiagnosticError, validate } from '@react-whatsapp-templates/validate'
import { expect, test } from 'vitest'

/**
 * The structural rules the type system cannot reach (ADR-0003), read through
 * the compilers, which refuse to emit a payload Meta is already known to
 * reject (ADR-0006).
 */

interface TwoProps {
  firstName: string
  lastName: string
}

function codesFor(template: AnyTemplate): string[] {
  return validate(walk(template)).map((diagnostic) => diagnostic.code)
}

test('WT0001 — two props declared under one wire name', () => {
  function Collision({ firstName, lastName }: Vars<TwoProps>) {
    return (
      <Template name="collision" language="en_US" category="UTILITY">
        <Body>
          Hi {variable(firstName, { name: 'name', example: 'Pablo' })}
          {variable(lastName, { name: 'name', example: 'Morales' })}.
        </Body>
      </Template>
    )
  }

  expect(codesFor(Collision)).toEqual(['WT0001'])
  expect(validate(walk(Collision))[0]?.message).toContain('{{name}} is declared for')
})

test('WT0002 — one prop declared under two wire names', () => {
  function Split({ firstName }: Vars<{ firstName: string }>) {
    return (
      <Template name="split" language="en_US" category="UTILITY">
        <Body>
          Hi {variable(firstName, { name: 'first_name', example: 'Pablo' })}, or{' '}
          {variable(firstName, { name: 'given_name', example: 'Pablo' })}.
        </Body>
      </Template>
    )
  }

  expect(codesFor(Split)).toEqual(['WT0002'])
})

test('WT0003 — a prop never passed to variable()', () => {
  function Forgotten({ firstName, lastName: _lastName }: Vars<TwoProps>) {
    return (
      <Template name="forgotten" language="en_US" category="UTILITY">
        <Body>Hi {variable(firstName, { name: 'first_name', example: 'Pablo' })}.</Body>
      </Template>
    )
  }

  expect(codesFor(Forgotten)).toEqual(['WT0003'])
  expect(validate(walk(Forgotten))[0]?.message).toContain('"lastName"')
})

test('WT0004 — a template mixing named and positional wire names', () => {
  function Mixed({ firstName, lastName }: Vars<TwoProps>) {
    return (
      <Template name="mixed" language="en_US" category="UTILITY">
        <Body>
          Hi {variable(firstName, { name: 'first_name', example: 'Pablo' })}{' '}
          {variable(lastName, { name: 1, example: 'Morales' })}.
        </Body>
      </Template>
    )
  }

  expect(codesFor(Mixed)).toEqual(['WT0004'])
})

test('WT0005 — positional names with a gap', () => {
  function Gap({ firstName, lastName }: Vars<TwoProps>) {
    return (
      <Template name="gap" language="en_US" category="UTILITY">
        <Body>
          Hi {variable(firstName, { name: 1, example: 'Pablo' })}{' '}
          {variable(lastName, { name: 3, example: 'Morales' })}.
        </Body>
      </Template>
    )
  }

  expect(codesFor(Gap)).toEqual(['WT0005'])
})

test('WT0005 — positional names out of the order they appear in', () => {
  function Reversed({ firstName, lastName }: Vars<TwoProps>) {
    return (
      <Template name="reversed" language="en_US" category="UTILITY">
        <Body>
          Hi {variable(firstName, { name: 2, example: 'Pablo' })}{' '}
          {variable(lastName, { name: 1, example: 'Morales' })}.
        </Body>
      </Template>
    )
  }

  expect(codesFor(Reversed)).toEqual(['WT0005'])
})

test('the compilers refuse to emit an invalid payload', async () => {
  function Forgotten({ firstName: _firstName }: Vars<{ firstName: string }>) {
    return (
      <Template name="forgotten" language="en_US" category="UTILITY">
        <Body>Nothing is filled in here.</Body>
      </Template>
    )
  }

  const error = await toCreatePayload(Forgotten).catch((thrown: unknown) => thrown)

  expect(error).toBeInstanceOf(DiagnosticError)
  expect((error as DiagnosticError).diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
    'WT0003',
  ])
})
