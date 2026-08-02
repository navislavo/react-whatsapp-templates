import type { TemplateIR } from '@react-whatsapp-templates/core'
import { DiagnosticError, type Diagnostic } from './diagnostic'
import { RULE_CATALOG } from './rules'

export {
  DiagnosticError,
  type Diagnostic,
  type Rule,
  type RuleCode,
  type Severity,
} from './diagnostic'
export { RULE_CATALOG } from './rules'

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

/**
 * Throws a {@link DiagnosticError} when a template breaks a rule that would
 * have Meta reject it. Warnings pass through untouched, which is what makes
 * `severity` load-bearing rather than presentation (ADR-0006).
 */
export function assertValid(ir: TemplateIR): void {
  const errors = validate(ir).filter((diagnostic) => diagnostic.severity === 'error')
  if (errors.length > 0) throw new DiagnosticError(errors)
}
