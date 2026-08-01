/**
 * Template language codes, transcribed from `docs/supported-languages.md`.
 *
 * A template is identified by a `(name, language)` pair, so this is not a
 * cosmetic enum — a code Meta does not know is a rejected template.
 */
export const SUPPORTED_LANGUAGE_CODES = [
  'af', 'sq', 'ar', 'ar_EG', 'ar_AE', 'ar_LB',
  'ar_MA', 'ar_QA', 'az', 'be_BY', 'bn', 'bn_IN',
  'bg', 'ca', 'zh_CN', 'zh_HK', 'zh_TW', 'hr',
  'cs', 'da', 'prs_AF', 'nl', 'nl_BE', 'en',
  'en_GB', 'en_US', 'en_AE', 'en_AU', 'en_CA', 'en_GH',
  'en_IE', 'en_IN', 'en_JM', 'en_MY', 'en_NZ', 'en_QA',
  'en_SG', 'en_UG', 'en_ZA', 'et', 'fil', 'fi',
  'fr', 'fr_BE', 'fr_CA', 'fr_CH', 'fr_CI', 'fr_MA',
  'ka', 'de', 'de_AT', 'de_CH', 'el', 'gu',
  'ha', 'he', 'hi', 'hu', 'id', 'ga',
  'it', 'ja', 'kn', 'kk', 'rw_RW', 'ko',
  'ky_KG', 'lo', 'lv', 'lt', 'mk', 'ms',
  'ml', 'mr', 'nb', 'ps_AF', 'fa', 'pl',
  'pt_BR', 'pt_PT', 'pa', 'ro', 'ru', 'sr',
  'si_LK', 'sk', 'sl', 'es', 'es_AR', 'es_CL',
  'es_CO', 'es_CR', 'es_DO', 'es_EC', 'es_HN', 'es_MX',
  'es_PA', 'es_PE', 'es_ES', 'es_UY', 'sw', 'sv',
  'ta', 'te', 'th', 'tr', 'uk', 'ur',
  'uz', 'vi', 'zu',
] as const

/** A language code Meta accepts. Never `string`. */
export type LanguageCode = (typeof SUPPORTED_LANGUAGE_CODES)[number]

export function isLanguageCode(value: string): value is LanguageCode {
  return (SUPPORTED_LANGUAGE_CODES as readonly string[]).includes(value)
}
