import type { Command, Shell } from '../types'
import { quote } from './quote.ts'

/**
 * Render a command line for the given shell.
 *
 * The tool name comes first, then each argument: flags render as their bare
 * name, options as the flag name followed by the quoted value, and values as
 * the quoted value. The spec stores flag names without a leading dash.
 */
export function render(command: Command, shell: Shell): string {
  const parts: string[] = [command.tool]
  for (const arg of command.args) {
    if (arg.kind === 'option' && arg.value !== undefined) {
      parts.push(arg.name, quote(arg.value, shell))
    } else if (arg.kind === 'value') {
      parts.push(quote(arg.value ?? arg.name, shell))
    } else {
      parts.push(arg.name)
    }
  }
  return parts.join(' ')
}
