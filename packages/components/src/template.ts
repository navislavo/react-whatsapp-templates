import type {
  LanguageCode,
  TemplateCategory,
  ValidateTemplateName,
} from '@react-whatsapp-templates/core'
import type { ReactElement, ReactNode } from 'react'
import { markHost, unreachable } from './host'

export interface TemplateProps<Name extends string> {
  /**
   * The template name. Checked against `^[a-z0-9_]+$` (max 512 characters) at
   * compile time — see `docs/overview.md#names`.
   */
  name: Name & ValidateTemplateName<Name>
  language: LanguageCode
  category: TemplateCategory
  children?: ReactNode
}

/**
 * The root of every template. A template is identified by its
 * `(name, language)` pair.
 */
export const Template = markHost(function Template<const Name extends string>(
  _props: TemplateProps<Name>,
): ReactElement {
  return unreachable('Template')
}, 'template')
