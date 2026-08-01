import { demo } from './commands/demo'

export { demo, type DemoOptions } from './commands/demo'
export { loadTemplate, type LoadedTemplate } from './load-template'

const USAGE = `whatsapp — WhatsApp message templates, authored in React

Usage:
  whatsapp demo <template> [--to <phone-number>]   print the create and send payloads
`

/** Returns the process exit code. */
export async function run(argv: readonly string[]): Promise<number> {
  const [command, ...rest] = argv

  if (command === undefined || command === '--help' || command === '-h') {
    console.log(USAGE)
    return command === undefined ? 1 : 0
  }

  if (command !== 'demo') {
    console.error(`Unknown command: ${command}\n\n${USAGE}`)
    return 1
  }

  const [file, ...flags] = rest
  if (file === undefined) {
    console.error(`whatsapp demo needs a template file.\n\n${USAGE}`)
    return 1
  }

  const to = readFlag(flags, '--to')

  try {
    await demo(file, to === undefined ? {} : { to })
    return 0
  } catch (error) {
    console.error(error instanceof Error ? `${error.name}: ${error.message}` : String(error))
    return 1
  }
}

function readFlag(flags: readonly string[], name: string): string | undefined {
  const index = flags.indexOf(name)
  if (index === -1) return undefined

  const value = flags[index + 1]
  if (value === undefined) throw new Error(`${name} needs a value.`)
  return value
}
