/**
 * The template-name field rule, enforced by the type system.
 *
 * > Template names are limited to a maximum of 512 characters, consisting of
 * > lowercase alphanumeric characters and underscores.
 * > — `docs/overview.md#names`
 *
 * This is a *field rule* (ADR-0003): it constrains one component's own props,
 * so it is a compile error rather than a `WT####` diagnostic.
 */

export const TEMPLATE_NAME_PATTERN = /^[a-z0-9_]+$/
export const TEMPLATE_NAME_MAX_LENGTH = 512

export function isTemplateName(value: string): boolean {
  return value.length <= TEMPLATE_NAME_MAX_LENGTH && TEMPLATE_NAME_PATTERN.test(value)
}

type LowercaseLetter =
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm'
  | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

/** The only characters `^[a-z0-9_]+$` admits. */
type TemplateNameChar = LowercaseLetter | Digit | '_'

/**
 * Walks the literal one character at a time, counting as it goes. Written
 * tail-recursively so a 512-character name stays inside TypeScript's
 * instantiation budget.
 */
type CheckTemplateName<S extends string, Seen extends 0[] = []> = S extends `${infer Head}${infer Rest}`
  ? [Head] extends [TemplateNameChar]
    ? Seen['length'] extends 512
      ? 'too-long'
      : CheckTemplateName<Rest, [...Seen, 0]>
    : 'invalid-char'
  : Seen['length'] extends 0
    ? 'empty'
    : 'ok'

/**
 * The type an invalid name collapses to. Its type argument is the rule text,
 * so `tsc` prints the rule at the call site rather than "not assignable to
 * type 'never'".
 */
export type InvalidTemplateName<Rule extends string> = {
  readonly __invalidTemplateName: Rule
}

/**
 * Resolves to `Name` when the literal satisfies Meta's rule, and to an
 * {@link InvalidTemplateName} carrying the rule text when it does not.
 *
 * Used as `name: Name & ValidateTemplateName<Name>` so `Name` still has a
 * naked inference site.
 */
export type ValidateTemplateName<Name extends string> = CheckTemplateName<Name> extends 'ok'
  ? Name
  : CheckTemplateName<Name> extends 'empty'
    ? InvalidTemplateName<'a template name must not be empty'>
    : CheckTemplateName<Name> extends 'too-long'
      ? InvalidTemplateName<'a template name may be at most 512 characters'>
      : InvalidTemplateName<'a template name must match ^[a-z0-9_]+$ — lowercase letters, digits and underscores only'>
