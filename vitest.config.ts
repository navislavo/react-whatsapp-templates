import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const src = (pkg: string) => fileURLToPath(new URL(`./packages/${pkg}/src/index.ts`, import.meta.url))

export default defineConfig({
  resolve: {
    // Tests run against source, so `pnpm test` never waits on a build.
    alias: {
      '@react-whatsapp-templates/components': src('components'),
      '@react-whatsapp-templates/core': src('core'),
      '@react-whatsapp-templates/render': src('render'),
      '@react-whatsapp-templates/validate': src('validate'),
      '@react-whatsapp-templates/preview': src('preview'),
      '@react-whatsapp-templates/cli': src('cli'),
      'react-whatsapp-templates': src('react-whatsapp-templates'),
    },
  },
  test: {
    include: ['packages/*/test/**/*.test.{ts,tsx}'],
  },
})
