import type { ValidateWireName } from './wire-name'

/**
 * Variables are declared where they are used, by passing the token a prop
 * arrives as to `variable()` (ADR-0007). Both halves of the mechanism live
 * here: the opaque token, and the slot a declaration produces.
 */

declare const VAR_TYPE: unique symbol
declare const SLOT_TYPE: unique symbol

/**
 * The opaque token an author receives in place of a prop value while the
 * component is being evaluated.
 *
 * It has no methods, carries a phantom type so send values can be recovered
 * from `Vars<P>`, and throws from `toString()` — a token can only be turned
 * into a variable by passing it to {@link variable}.
 */
export interface Var<T> {
  /** Phantom. Never present at runtime. */
  readonly [VAR_TYPE]: T
  /** Always throws, naming `variable()`. */
  toString(): never
}

/** Every prop of `P`, replaced by the token the walker supplies for it. */
export type Vars<P> = { readonly [K in keyof P]: Var<P[K]> }

/**
 * A declared variable, as it appears in the text of a component. Opaque for the
 * same reason `Var` is: `toString()` throws rather than baking
 * `[object Object]` into a payload.
 */
export interface Slot {
  /** Phantom. Never present at runtime. */
  readonly [SLOT_TYPE]: 'slot'
  /** Always throws. */
  toString(): never
}

/** What a slot carries, read by the walker. */
export interface SlotDeclaration {
  /** The identifier Meta sees. A string is named format, a number positional. */
  readonly name: string | number
  /** The example value Meta requires at registration. */
  readonly example: string
  /** The prop this slot binds to. */
  readonly prop: string
}

export interface VariableOptions<Name extends string | number> {
  /**
   * The identifier Meta will see — written, never derived from the prop name,
   * so a template can match one already registered on a WABA. A string means
   * named format, a number means positional (`{{1}}`).
   */
  name: Name & ValidateWireName<Name>
  /** Meta requires an example for every parameter. Always a plain string. */
  example: string
}

const VAR_PROP: unique symbol = Symbol.for('react-whatsapp-templates.var')
const SLOT_DECLARATION: unique symbol = Symbol.for('react-whatsapp-templates.slot')

interface VarToken {
  readonly [VAR_PROP]: string
}

interface SlotValue {
  readonly [SLOT_DECLARATION]: SlotDeclaration
}

/**
 * Declares the variable a prop is supplied through, at the point it is used.
 *
 * ```tsx
 * <Body>Hi {variable(firstName, { name: 'first_name', example: 'Pablo' })}.</Body>
 * ```
 *
 * Repeated declarations of one name merge into a single variable; a diverging
 * `example` resolves to the last declaration in authored order (ADR-0007).
 */
export function variable<T, const Name extends string | number>(
  token: Var<T>,
  options: VariableOptions<Name>,
): Slot {
  const prop = propOf(token)
  if (prop === undefined) {
    throw new TypeError(
      'variable() takes one of the props the walker supplied — ' +
        `got ${describe(token)}. Only a template's own props can become variables.`,
    )
  }

  const declaration: SlotDeclaration = {
    name: options.name as string | number,
    example: options.example,
    prop,
  }

  return Object.freeze({
    [SLOT_DECLARATION]: declaration,
    toString(): never {
      throw new TypeError(
        `The variable {{${declaration.name}}} cannot be turned into text. Pass it as a ` +
          'child of the component it belongs to rather than interpolating it into a string.',
      )
    },
  }) as unknown as Slot
}

/** Mints the token a prop arrives as. Called by the walker, never by an author. */
export function createVarToken(prop: string): Var<unknown> {
  return Object.freeze({
    [VAR_PROP]: prop,
    toString(): never {
      throw new TypeError(
        `The prop "${prop}" cannot be turned into text. Declare it first — ` +
          `variable(${prop}, { name: '…', example: '…' }) — and use what that returns.`,
      )
    },
  }) as unknown as Var<unknown>
}

/** The declaration a slot carries, or `undefined` if the value is not a slot. */
export function slotDeclaration(value: unknown): SlotDeclaration | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  return (value as Partial<SlotValue>)[SLOT_DECLARATION]
}

/** The prop a token was minted for, or `undefined` if the value is not a token. */
export function propOf(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  return (value as Partial<VarToken>)[VAR_PROP]
}

function describe(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value)
  if (slotDeclaration(value) !== undefined) return 'a variable that was already declared'
  if (typeof value === 'object' && value !== null) return value.constructor?.name ?? 'an object'
  return String(value)
}
