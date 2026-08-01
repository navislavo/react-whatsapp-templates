import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import type { ComponentType } from 'react'

export interface LoadedTemplate {
  readonly path: string
  readonly component: ComponentType<Record<string, never>>
}

/**
 * Imports a template module. Templates are authored in TSX, so the file is
 * loaded through `tsx` rather than Node's own loader.
 */
export async function loadTemplate(file: string): Promise<LoadedTemplate> {
  const path = resolve(process.cwd(), file)
  const { tsImport } = await import('tsx/esm/api')
  const module: unknown = await tsImport(pathToFileURL(path).href, import.meta.url)

  const component = (module as { default?: unknown }).default
  if (typeof component !== 'function') {
    throw new Error(`${file} has no default export — a template module must default-export one.`)
  }

  return { path, component: component as ComponentType<Record<string, never>> }
}
