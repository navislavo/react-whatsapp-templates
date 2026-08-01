/**
 * Every template is categorized as authentication, marketing, or utility.
 * See `docs/template-categorization.md`.
 */
export const TEMPLATE_CATEGORIES = ['AUTHENTICATION', 'MARKETING', 'UTILITY'] as const

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]
