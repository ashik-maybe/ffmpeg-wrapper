/**
 * Pure types of the command IR. This file is frozen after P1.
 */

export type Shell = 'posix' | 'powershell' | 'cmd'

export type ArgKind = 'flag' | 'option' | 'value'

export interface Arg {
  readonly kind: ArgKind
  readonly name: string
  readonly value?: string
  readonly alias?: string
}

export interface Command {
  readonly tool: string
  readonly args: readonly Arg[]
}

export interface Recipe {
  readonly id: string
  readonly tool: string
  readonly args: readonly Arg[]
}

export interface Plan {
  readonly recipe: Recipe
  readonly args: readonly Arg[]
}

export interface OptionSpec {
  readonly name: string
  readonly kind: ArgKind
  readonly aliases?: readonly string[]
  readonly metavar?: string
  readonly choices?: readonly string[]
  readonly default?: string
}

export interface ToolSpec {
  readonly tool: string
  readonly version: string
  readonly options: readonly OptionSpec[]
}

export type Severity = 'error' | 'warning' | 'info'

export type ErrorCode =
  | 'E_UNKNOWN_OPTION'
  | 'E_MISSING_VALUE'
  | 'E_INVALID_CHOICE'
  | 'E_CONFLICT'
  | 'E_REQUIRES'
  | 'E_UNVERIFIED'

export interface Finding {
  readonly severity: Severity
  readonly code: ErrorCode
  readonly message: string
  readonly file: string
  readonly line?: number
}

export interface Route {
  readonly page: string
  readonly params: Readonly<Record<string, string>>
}
