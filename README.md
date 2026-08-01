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
an invalid template name, an unsupported language code. They are checked by `pnpm typecheck`
only, and a directive that stops erroring fails the build.

Rules that TypeScript cannot reach — anything constraining components relative to their
siblings — are runtime diagnostics instead (ADR-0003).
