import type { TemplateIR } from '@react-whatsapp-templates/core'
import {
  DiagnosticError,
  RULE_CATALOG,
  assertValid,
  validate,
} from '@react-whatsapp-templates/validate'
import { expect, test } from 'vitest'

/**
 * The rules read straight from a hand-built IR — the one place the IR is
 * written by hand rather than walked, so the catalog is testable without the
 * walker or React.
 */
function ir(slots: TemplateIR['slots'], props: readonly string[]): TemplateIR {
  return {
    name: 'order_confirmation',
    language: 'en_US',
    category: 'UTILITY',
    components: [{ kind: 'body', text: 'irrelevant to these rules' }],
    slots,
    props,
  }
}

const valid = ir(
  [{ name: 'first_name', component: 'body', example: 'Pablo', prop: 'firstName' }],
  ['firstName'],
)

test('a template that breaks no rule reports nothing', () => {
  expect(validate(valid)).toEqual([])
  expect(() => assertValid(valid)).not.toThrow()
})

test('every rule carries its text, a reference into docs/, and a stable code', () => {
  const codes = RULE_CATALOG.map((rule) => rule.code)

  expect(new Set(codes).size).toBe(codes.length)

  for (const rule of RULE_CATALOG) {
    expect(rule.code).toMatch(/^WT\d{4}$/)
    expect(rule.rule.length).toBeGreaterThan(0)
    expect(rule.reference).toMatch(/^docs\//)
  }
})

test('a diagnostic carries the rule it derives from', () => {
  const [diagnostic] = validate(ir([], ['firstName']))

  expect(diagnostic).toMatchObject({
    code: 'WT0003',
    severity: 'error',
    reference: 'docs/adr/0007-variables-are-declared-as-values-with-written-wire-names.md',
  })
})

test('an error-severity diagnostic throws, carrying the diagnostics', () => {
  const thrown = (() => {
    try {
      assertValid(ir([], ['firstName']))
    } catch (error) {
      return error
    }
    return undefined
  })()

  expect(thrown).toBeInstanceOf(DiagnosticError)
  expect((thrown as DiagnosticError).diagnostics).toHaveLength(1)
  expect((thrown as DiagnosticError).message).toContain('WT0003')
})
