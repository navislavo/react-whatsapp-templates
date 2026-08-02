export { TEMPLATE_CATEGORIES, type TemplateCategory } from './category'
export { SUPPORTED_LANGUAGE_CODES, isLanguageCode, type LanguageCode } from './language'
export {
  TEMPLATE_NAME_MAX_LENGTH,
  TEMPLATE_NAME_PATTERN,
  isTemplateName,
  type InvalidTemplateName,
  type ValidateTemplateName,
} from './template-name'
export {
  WIRE_NAME_PATTERN,
  isWireName,
  type InvalidWireName,
  type ValidateWireName,
} from './wire-name'
export {
  createVarToken,
  propOf,
  slotDeclaration,
  variable,
  type Slot,
  type SlotDeclaration,
  type Var,
  type VariableOptions,
  type Vars,
} from './variable'
export { currency, dateTime } from './parameter'
export { parameterFormat, type ParameterFormat } from './parameter-format'
export type { BodyIR, ComponentIR, SlotIR, TemplateIR } from './ir'
export type {
  CreateBodyComponent,
  CreateBodyExample,
  CreateComponent,
  CreateNamedParamExample,
  CreateTemplatePayload,
} from './wire/create'
export type {
  CurrencyValue,
  DateTimeValue,
  SendBodyComponent,
  SendComponent,
  SendCurrencyParameter,
  SendDateTimeParameter,
  SendParameter,
  SendPayload,
  SendTextParameter,
  TemplateMessage,
} from './wire/send'
