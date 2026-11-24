/**
 * Shell quoting for the values of the command IR.
 *
 * Escaping rules per shell:
 *
 * - posix: the value is wrapped in single quotes. An embedded single quote is
 *   replaced with '\'' (close the quote, an escaped quote, reopen). Double
 *   quotes, dollar signs, backticks, semicolons and newlines need no escape:
 *   inside POSIX single quotes they are passed through literally.
 * - powershell: the value is wrapped in single quotes. An embedded single
 *   quote is doubled. Inside single quotes, double quotes, dollar signs,
 *   backticks, semicolons and newlines are literal.
 * - cmd: the value is wrapped in double quotes. An embedded double quote is
 *   doubled. Inside double quotes, single quotes, dollar signs, backticks
 *   and semicolons are literal.
 */

import type { Shell } from '../types'

/**
 * Quote one value for the given shell so the shell passes it through intact.
 */
export function quote(value: string, shell: Shell): string {
  if (shell === 'posix') {
    return `'${value.replace(/'/g, "'\\''")}'`
  }
  if (shell === 'powershell') {
    return `'${value.replace(/'/g, "''")}'`
  }
  return `"${value.replace(/"/g, '""')}"`
}
