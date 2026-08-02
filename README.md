# react-whatsapp-templates

A React DSL for authoring WhatsApp message templates, where Meta's template grammar is
enforced by TypeScript as far as it can reach and by a documented diagnostic catalog
everywhere else.

```tsx
import { Body, Template } from 'react-whatsapp-templates'

export default function StoreClosure() {
  return (
    <Template name="store_closure" language="en_US" category="UTILITY">
      <Body>We are closed on Monday for a public holiday.</Body>
    </Template>
  )
}
```

```sh
pnpm demo   # prints both Meta payloads for the template above
```

## Variables

A template's props become Meta's variables. Each one is declared where it is used, and the
name Meta will see is written by hand rather than derived from the prop — so a template can
match one already registered on a WABA (ADR-0007).

```tsx
import { Body, Template, variable, type Vars } from 'react-whatsapp-templates'

interface Props {
  firstName: string
  orderId: string
}

export default function OrderShipped({ firstName, orderId }: Vars<Props>) {
  const order = variable(orderId, { name: 'order_id', example: '860198-230332' })

  return (
    <Template name="order_shipped" language="en_US" category="UTILITY">
      <Body>
        Hi {variable(firstName, { name: 'first_name', example: 'Pablo' })}, your order {order} has
        shipped.
      </Body>
    </Template>
  )
}
```

```ts
await toCreatePayload(OrderShipped)
// "parameter_format": "named"
// "text": "Hi {{first_name}}, your order {{order_id}} has shipped."
// "example": { "body_text_named_params": [{ "param_name": "first_name", "example": "Pablo" }, …] }

await toTemplateMessage(OrderShipped, { firstName: 'Jessica', orderId: 'SKBUP2-4CPIG9' })
// "parameters": [{ "type": "text", "parameter_name": "first_name", "text": "Jessica" }, …]
```

A prop arrives as an opaque `Var` token: it has no methods, and `toString()` throws, so a
prop can only reach a payload by way of `variable()`. A number name — `{ name: 1 }` — is
Meta's positional format instead; `parameter_format` is derived from the names actually
used and is always emitted. Mixing the two in one template is a diagnostic, as are two
props under one name, one prop under two, and a prop never declared at all.

## The pipeline

```
component fn ──evaluate──▶ element tree ──walk──▶ TemplateIR ──compile──▶ CreateTemplatePayload
                                                       └──compile+values──▶ TemplateMessage
```

The walker is a synchronous tree walk over function components, Fragments and our host
components — no `react-dom` and no reconciler, because a template is a fixed shallow schema
rather than a document. `TemplateIR` is the only thing the validator and both compilers
read, which is what keeps the two payloads from drifting apart: the create payload uses
uppercase component types and a bare language string, the send payload uses lowercase types
and a language object, and they share no serializer.

The component is evaluated **once**, with every prop replaced by a token (ADR-0001). The
send payload carries no rendered text — only parameter values — so it is a function of the
IR's slots and the caller's values, never of a second evaluation. Both compilers run the
validator first and refuse to emit a payload Meta is already known to reject (ADR-0006).

## Packages

| Package                                  | Contains                                             |
| ---------------------------------------- | ---------------------------------------------------- |
| `@react-whatsapp-templates/core`         | `TemplateIR`, Meta wire types, field rules. No React. |
| `@react-whatsapp-templates/components`   | `<Template>`, `<Body>` — the host components.         |
| `@react-whatsapp-templates/render`       | The walker and the two compilers.                     |
| `@react-whatsapp-templates/validate`     | The rule catalog and the diagnostics engine.          |
| `@react-whatsapp-templates/preview`      | The preview server.                                   |
| `@react-whatsapp-templates/cli`          | The `whatsapp` CLI.                                   |
| `react-whatsapp-templates`               | Umbrella re-export.                                   |

## Development

```sh
pnpm install
pnpm build       # tsdown, every package
pnpm test        # vitest, against source
pnpm typecheck   # tsc --noEmit, including type-tests/
```

`type-tests/` holds `@ts-expect-error` assertions for the rules the type system enforces —
an invalid template name, an unsupported language code, a wire name that is not
`^[a-z0-9_]+$`, a send value that is missing or unknown. They are checked by `pnpm typecheck`
only, and a directive that stops erroring fails the build.

Rules that TypeScript cannot reach — anything constraining components relative to their
siblings — are runtime diagnostics instead (ADR-0003).
