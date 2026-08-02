/**
 * The wire-name field rule, enforced by the type system.
 *
 * > Parameters using the named format must be unique, single strings, composed
 * > of lowercase characters and underscores, wrapped in double curly brackets,
 * > for example, `{{first_name}}`.
 * >
 * > Positional parameters must be ordered array index numbers, starting from 1,
 * > wrapped in double curly brackets: (`{{1}}`…`{{2}}`…and so on).
 * > — `docs/overview.md#parameter-formats`
 *
 * This is a *field rule* (ADR-0003): it constrains one `variable()` call's own
 * argument, so it is a compile error rather than a `WT####` diagnostic. Which
 * of the two formats a template uses is derived from the names — see
 * `parameter-format.ts`.
 *
 * **Knowingly one character class wider than `docs/overview.md:71`.** The
 * mirror's prose admits only lowercase characters and underscores; we admit
 * digits too, matching the template-name class. Two reasons: a name Meta really
 * does reject costs one create request that names the offending parameter,
 * whereas a name Meta accepts but we reject cannot be written at all — and a
 * template already registered on a WABA with `item_2` in it must stay
 * expressible, since matching an existing registration is the whole reason the
 * author writes wire names by hand (ADR-0007).
 */

export const WIRE_NAME_PATTERN = /^[a-z0-9_]+$/

export function isWireName(value: string | number): boolean {
  return typeof value === 'number'
    ? Number.isInteger(value) && value >= 1
    : WIRE_NAME_PATTERN.test(value)
}

type LowercaseLetter =
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm'
  | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

/** The only characters `^[a-z0-9_]+$` admits. */
type WireNameChar = LowercaseLetter | Digit | '_'

/**
 * Walks the literal one character at a time, as `template-name.ts` does. There
 * is no length cap here — Meta documents none for a variable name — so the walk
 * carries a "have we seen anything" flag rather than a counter.
 */
type CheckWireName<S extends string, Seen extends boolean = false> = string extends S
  ? 'ok' // A widened `string` carries no characters to check.
  : S extends `${infer Head}${infer Rest}`
    ? [Head] extends [WireNameChar]
      ? CheckWireName<Rest, true>
      : 'invalid-char'
    : Seen extends true
      ? 'ok'
      : 'empty'

type CheckPositionalName<N extends number> = number extends N
  ? 'ok'
  : `${N}` extends `-${string}`
    ? 'not-counting-from-one'
    : `${N}` extends `${bigint}`
      ? N extends 0
        ? 'not-counting-from-one'
        : 'ok'
      : 'not-whole'

/**
 * The type an invalid name collapses to. Its type argument is the rule text, so
 * `tsc` prints the rule at the `variable()` call rather than "not assignable to
 * type 'never'".
 */
export type InvalidWireName<Rule extends string> = {
  readonly __invalidWireName: Rule
}

/**
 * Resolves to `Name` when the literal is a wire name Meta accepts, and to an
 * {@link InvalidWireName} carrying the rule text when it does not.
 *
 * Used as `name: Name & ValidateWireName<Name>` so `Name` still has a naked
 * inference site.
 */
export type ValidateWireName<Name extends string | number> = [Name] extends [number]
  ? CheckPositionalName<Name> extends 'ok'
    ? Name
    : CheckPositionalName<Name> extends 'not-whole'
      ? InvalidWireName<'a positional variable name must be a whole number'>
      : InvalidWireName<'positional variable names count from 1'>
  : [Name] extends [string]
    ? CheckWireName<Name> extends 'ok'
      ? Name
      : CheckWireName<Name> extends 'empty'
        ? InvalidWireName<'a variable name must not be empty'>
        : InvalidWireName<'a variable name must match ^[a-z0-9_]+$ — lowercase letters, digits and underscores only'>
    : never
