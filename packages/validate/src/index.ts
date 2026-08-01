import type { TemplateIR } from '@react-whatsapp-templates/core'

/**
 * The shape of a rule violation. Field rules are compile errors; everything
 * reported here is a structural rule, which TypeScript cannot reach (ADR-0003).
 */
export interface Diagnostic {
  /** Stable identifier, e.g. `WT0001`. Never renumbered. */
  readonly code: RuleCode
  readonly severity: Severity
  /** What the author did wrong, in this template. */
  readonly message: string
  /** Meta's rule, verbatim. */
  readonly rule: string
  /** Path into `docs/`, e.g. `docs/components.md#body`. */
  readonly reference: string
}

export type Severity = 'error' | 'warning'

export type RuleCode = `WT${number}`

/**
 * The single definition of every diagnostic, consumed by the validator, the
 * CLI, the preview server and the ESLint plugin — none of which re-derive rules
 * of their own.
 *
 * Empty at the walking skeleton: a static body-only template has no structural
 * rules to break that the walker does not already reject as not-a-template.
 */
export interface Rule {
  readonly code: RuleCode
  readonly severity: Severity
  readonly rule: string
  readonly reference: string
  /** Whether an ESLint pass over the JSX AST can detect this without evaluating. */
  readonly staticallyDetectable: boolean
  check(ir: TemplateIR): readonly string[]
}

export const RULE_CATALOG: readonly Rule[] = []

/** Reports every rule violation in a template. */
export function validate(ir: TemplateIR): Diagnostic[] {
  return RULE_CATALOG.flatMap((rule) =>
    rule.check(ir).map(
      (message): Diagnostic => ({
        code: rule.code,
        severity: rule.severity,
        message,
        rule: rule.rule,
        reference: rule.reference,
      }),
    ),
  )
}
