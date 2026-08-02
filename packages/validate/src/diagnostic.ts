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
  /** Meta's rule, verbatim — or this project's own, where Meta states none. */
  readonly rule: string
  /** Path into `docs/`, e.g. `docs/components.md#body`. */
  readonly reference: string
}

export type Severity = 'error' | 'warning'

export type RuleCode = `WT${number}`

/**
 * One entry in the rule catalog — the single definition of every diagnostic,
 * consumed by the validator, the CLI, the preview server and the ESLint plugin,
 * none of which re-derive rules of their own.
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

/**
 * Thrown by the compilers when a template would produce a payload Meta is
 * already known to reject (ADR-0006). Carries the diagnostics rather than a
 * formatted string, so every consumer still presents them its own way.
 */
export class DiagnosticError extends Error {
  override name = 'DiagnosticError'
  readonly diagnostics: readonly Diagnostic[]

  constructor(diagnostics: readonly Diagnostic[]) {
    super(formatDiagnostics(diagnostics))
    this.diagnostics = diagnostics
  }
}

function formatDiagnostics(diagnostics: readonly Diagnostic[]): string {
  const lines = diagnostics.map(
    (diagnostic) => `  ${diagnostic.code} ${diagnostic.message} (${diagnostic.reference})`,
  )

  return [
    diagnostics.length === 1
      ? 'This template breaks one of Meta’s rules:'
      : `This template breaks ${diagnostics.length} of Meta’s rules:`,
    ...lines,
  ].join('\n')
}
