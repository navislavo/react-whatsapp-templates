import type {
  CurrencyValue,
  DateTimeValue,
  SendCurrencyParameter,
  SendDateTimeParameter,
} from './wire/send'

/**
 * Send-value constructors for the two non-text parameter types. A prop typed as
 * one of these arrives at send time as the parameter object itself, so it
 * passes straight through the compiler with only `parameter_name` added.
 *
 * **No unit arithmetic anywhere.** `amount_1000` is the caller's number, not a
 * multiplication we perform: the mirror never documents the multiplier —
 * `docs/template-media.md:91-102` is its only occurrence, with a bare `NUMBER`
 * placeholder, and `docs/reference/` lacks Meta's Messages Parameters page.
 * Guessing it would be a silent factor-of-1000 error in a payment message.
 */

/** Meta's `currency` parameter, verbatim. */
export function currency(value: CurrencyValue): SendCurrencyParameter {
  return {
    type: 'currency',
    currency: {
      fallback_value: value.fallback_value,
      code: value.code,
      amount_1000: value.amount_1000,
    },
  }
}

/** Meta's `date_time` parameter, verbatim. */
export function dateTime(value: DateTimeValue): SendDateTimeParameter {
  return {
    type: 'date_time',
    date_time: { fallback_value: value.fallback_value },
  }
}
