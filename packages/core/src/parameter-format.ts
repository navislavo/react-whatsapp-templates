import type { SlotIR } from './ir'

/**
 * > Upon template creation, if a string includes one or more parameters, you
 * > can specify their format — either `named` or `positional` … If you do not
 * > specify a format, the template uses `positional` format by default.
 * > — `docs/overview.md#parameter-formats`
 */
export type ParameterFormat = 'named' | 'positional'

/**
 * The format a template's wire names put it in. Derived rather than declared,
 * which is what keeps `parameter_format` from drifting away from the names
 * actually used (ADR-0007).
 *
 * A template mixing string and numeric names is a diagnostic, so by the time a
 * payload is emitted the slots are all of one kind. A template with no
 * variables at all has no format to derive: it reports `positional`, which is
 * the default Meta would apply anyway — the field is emitted explicitly either
 * way, never left implicit.
 */
export function parameterFormat(slots: readonly SlotIR[]): ParameterFormat {
  return slots.some((slot) => typeof slot.name === 'string') ? 'named' : 'positional'
}
