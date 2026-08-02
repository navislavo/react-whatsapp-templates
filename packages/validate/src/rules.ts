import type { SlotIR } from '@react-whatsapp-templates/core'
import type { Rule } from './diagnostic'

/**
 * The rule catalog. Every rule here is structural — it constrains a template's
 * variables relative to one another, or to the props they came from, which is
 * beyond what the type system can see (ADR-0003).
 *
 * None of them are statically detectable yet: a wire name is an argument to
 * `variable()`, and that call can sit in a helper, behind an import, or
 * anywhere else an ESLint pass over one file's JSX cannot follow.
 */

/**
 * > Parameters using the named format must be unique, single strings, composed
 * > of lowercase characters and underscores, wrapped in double curly brackets,
 * > for example, `{{first_name}}`.
 */
const oneNamePerProp: Rule = {
  code: 'WT0001',
  severity: 'error',
  rule: 'Parameters using the named format must be unique, single strings, composed of lowercase characters and underscores, wrapped in double curly brackets, for example, {{first_name}}.',
  reference: 'docs/overview.md#named-parameters',
  staticallyDetectable: false,
  check(ir) {
    return groupBy(ir.slots, (slot) => nameKey(slot.name)).flatMap((group) => {
      const first = group[0]
      const props = distinct(group.map((slot) => `"${slot.prop}"`))
      if (first === undefined || props.length < 2) return []

      return [
        `${placeholder(first.name)} is declared for ${list(props)}. One wire name is one ` +
          'variable, so its value can only come from one prop.',
      ]
    })
  },
}

/**
 * This project's own rule rather than Meta's: two variables fed from one prop
 * would always carry the same value, so it is a mistake in the template rather
 * than something Meta rejects (ADR-0007).
 */
const onePropPerName: Rule = {
  code: 'WT0002',
  severity: 'error',
  rule: 'A prop is declared under exactly one wire name.',
  reference: 'docs/adr/0007-variables-are-declared-as-values-with-written-wire-names.md',
  staticallyDetectable: false,
  check(ir) {
    return groupBy(ir.slots, (slot) => slot.prop).flatMap((group) => {
      const first = group[0]
      const names = distinct(group.map((slot) => placeholder(slot.name)))
      if (first === undefined || names.length < 2) return []

      return [
        `The prop "${first.prop}" is declared as ${list(names)}. Declare it once and reuse what ` +
          'variable() returns, or take a second prop.',
      ]
    })
  },
}

/**
 * Also ours. A prop that is never declared has nowhere to put its value: the
 * template reads it, no slot binds to it, and whatever the caller passes at
 * send time is silently dropped.
 */
const everyPropDeclared: Rule = {
  code: 'WT0003',
  severity: 'error',
  rule: 'Every prop a template reads is declared as a variable with variable().',
  reference: 'docs/adr/0007-variables-are-declared-as-values-with-written-wire-names.md',
  staticallyDetectable: false,
  check(ir) {
    const declared = new Set(ir.slots.map((slot) => slot.prop))

    return ir.props
      .filter((prop) => !declared.has(prop))
      .map(
        (prop) =>
          `The prop "${prop}" is never passed to variable(), so nothing in the template is ` +
          'filled from it.',
      )
  },
}

/**
 * > Upon template creation, if a string includes one or more parameters, you
 * > can specify their format — either `named` or `positional`.
 */
const oneParameterFormat: Rule = {
  code: 'WT0004',
  severity: 'error',
  rule: 'Upon template creation, if a string includes one or more parameters, you can specify their format — either named or positional.',
  reference: 'docs/overview.md#parameter-formats',
  staticallyDetectable: false,
  check(ir) {
    const named = ir.slots.filter((slot) => typeof slot.name === 'string')
    const positional = ir.slots.filter((slot) => typeof slot.name === 'number')
    if (named.length === 0 || positional.length === 0) return []

    return [
      `This template mixes named variables (${list(named.map((slot) => placeholder(slot.name)))}) ` +
        `with positional ones (${list(positional.map((slot) => placeholder(slot.name)))}). A ` +
        'template is in one format or the other.',
    ]
  },
}

/**
 * > Positional parameters must be ordered array index numbers, starting from 1,
 * > wrapped in double curly brackets: (`{{1}}`…`{{2}}`…and so on). Example
 * > values in template creation payloads and real values in template send
 * > payloads must appear in the order in which their corresponding placeholders
 * > appear in the component text string.
 *
 * Both halves are one rule here, because from the compiler's side they are one
 * defect: the payload lists values in the order the placeholders appear, so
 * `{{2}}` before `{{1}}` sends every value to the wrong parameter.
 */
const positionalNamesCountFromOne: Rule = {
  code: 'WT0005',
  severity: 'error',
  rule: 'Positional parameters must be ordered array index numbers, starting from 1, wrapped in double curly brackets: ({{1}}...{{2}}...and so on). Example values in template creation payloads and real values in template send payloads must appear in the order in which their corresponding placeholders appear in the component text string.',
  reference: 'docs/overview.md#positional-parameters',
  staticallyDetectable: false,
  check(ir) {
    // A mixed template is WT0004's to report; this rule reads a template that
    // is positional throughout.
    if (ir.slots.some((slot) => typeof slot.name === 'string')) return []

    const names = ir.slots.flatMap((slot) => (typeof slot.name === 'number' ? [slot.name] : []))
    if (names.every((name, index) => name === index + 1)) return []

    return [
      `The positional variables appear as ${list(names.map(placeholder))}, but they must count ` +
        `from 1 in the order they appear — ${list(names.map((_, index) => placeholder(index + 1)))}.`,
    ]
  },
}

export const RULE_CATALOG: readonly Rule[] = [
  oneNamePerProp,
  onePropPerName,
  everyPropDeclared,
  oneParameterFormat,
  positionalNamesCountFromOne,
]

/** `1` and `'1'` are different wire names, so the type is part of the key. */
function nameKey(name: SlotIR['name']): string {
  return `${typeof name}:${name}`
}

function placeholder(name: SlotIR['name']): string {
  return `{{${name}}}`
}

function groupBy<T>(items: readonly T[], key: (item: T) => string): T[][] {
  const groups = new Map<string, T[]>()

  for (const item of items) {
    const group = groups.get(key(item))
    if (group === undefined) groups.set(key(item), [item])
    else group.push(item)
  }

  return [...groups.values()]
}

function distinct(values: readonly string[]): string[] {
  return [...new Set(values)]
}

function list(values: readonly string[]): string {
  const last = values[values.length - 1]
  if (values.length <= 1 || last === undefined) return values.join('')
  return `${values.slice(0, -1).join(', ')} and ${last}`
}
