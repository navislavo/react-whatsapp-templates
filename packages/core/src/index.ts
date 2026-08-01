export { TEMPLATE_CATEGORIES, type TemplateCategory } from './category'
export { SUPPORTED_LANGUAGE_CODES, isLanguageCode, type LanguageCode } from './language'
export {
  TEMPLATE_NAME_MAX_LENGTH,
  TEMPLATE_NAME_PATTERN,
  isTemplateName,
  type InvalidTemplateName,
  type ValidateTemplateName,
} from './template-name'
export type { BodyIR, ComponentIR, SlotIR, TemplateIR } from './ir'
export type { CreateBodyComponent, CreateComponent, CreateTemplatePayload } from './wire/create'
export type {
  SendBodyComponent,
  SendComponent,
  SendParameter,
  SendPayload,
  SendTextParameter,
  TemplateMessage,
} from './wire/send'
