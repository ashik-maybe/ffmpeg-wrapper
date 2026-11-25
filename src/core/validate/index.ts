import type { Arg, ErrorCode, Finding, Plan, Severity, ToolSpec } from '../types'
import rulesData from '../../data/rules.json'

/**
 * A rule read from `src/data/rules.json` as data.
 */
interface Rule {
  readonly code: ErrorCode
  readonly severity: Severity
  readonly message: string
  readonly fix: string
  readonly requireAny?: readonly string[]
  readonly requireAll?: readonly string[]
  readonly forbidAny?: readonly string[]
  readonly forbidFlagValues?: readonly {
    readonly flag: string
    readonly values: readonly string[]
  }[]
  readonly outputExtensions?: readonly string[]
  readonly valueConstraint?: ValueConstraint
  readonly order?: { readonly flag: string; readonly before: string }
}

/**
 * Value constraint of a rule: a forbidden value set, a required value
 * set, a numeric range, a substring, or a real file path.
 */
interface ValueConstraint {
  readonly oneOf?: readonly string[]
  readonly notOneOf?: readonly string[]
  readonly includes?: string
  readonly realFile?: boolean
  readonly min?: number
  readonly max?: number
}

const rules = (rulesData as { rules: Rule[] }).rules
const findingFile = 'src/core/validate/index.ts'

function normalize(name: string): string {
  return name.replace(/^-+/, '')
}

function matchesFlag(arg: Arg, flag: string): boolean {
  const wanted = normalize(flag)
  return (
    normalize(arg.name) === wanted || (arg.alias !== undefined && normalize(arg.alias) === wanted)
  )
}

function findArg(args: readonly Arg[], flag: string): Arg | undefined {
  return args.find((arg) => matchesFlag(arg, flag))
}

function hasFlag(args: readonly Arg[], flag: string): boolean {
  return findArg(args, flag) !== undefined
}

function violates(value: string, constraint: ValueConstraint): boolean {
  const { oneOf, notOneOf, includes, realFile, min, max } = constraint
  if (realFile) {
    if (value.trim().length === 0) return true
  }
  if (oneOf !== undefined || notOneOf !== undefined) {
    if (oneOf !== undefined && !oneOf.includes(value)) return true
    if (notOneOf !== undefined && notOneOf.includes(value)) return true
    return false
  }
  if (includes !== undefined) {
    return !value.includes(includes)
  }
  if (realFile) {
    return false
  }
  const number = Number(value)
  if (Number.isNaN(number)) return true
  if (min !== undefined && number < min) return true
  if (max !== undefined && number > max) return true
  return false
}

function finding(rule: Rule): Finding {
  return {
    severity: rule.severity,
    code: rule.code,
    message: rule.message,
    file: findingFile,
  }
}

function outputExtensionsOf(args: readonly Arg[]): string[] {
  return args
    .filter((arg) => arg.kind === 'value' && arg.value !== undefined)
    .map((arg) => {
      const value = arg.value ?? ''
      const dot = value.lastIndexOf('.')
      return dot >= 0 ? value.slice(dot + 1).toLowerCase() : ''
    })
    .filter((ext) => ext.length > 0)
}

/**
 * Validate a plan against a tool spec and return the findings.
 */
export function validate(plan: Plan, spec: ToolSpec): Finding[] {
  void spec
  const findings: Finding[] = []
  const args = plan.args
  for (const rule of rules) {
    const required = rule.requireAny
    if (required && !required.some((flag) => hasFlag(args, flag))) continue
    // valueConstraint gates requireAny: the rule fires on forbidAny only
    // when a required flag's value satisfies the constraint.
    const gatePassed =
      !rule.valueConstraint ||
      (required ?? []).some((flag) => {
        const value = findArg(args, flag)?.value
        return value !== undefined && !violates(value, rule.valueConstraint!)
      })
    if (rule.valueConstraint && !gatePassed) {
      if (
        rule.forbidAny === undefined &&
        rule.forbidFlagValues === undefined &&
        rule.outputExtensions === undefined
      ) {
        findings.push(finding(rule))
      }
      continue
    }
    for (const flag of rule.requireAll ?? []) {
      if (!hasFlag(args, flag)) findings.push(finding(rule))
    }
    for (const flag of rule.forbidAny ?? []) {
      if (hasFlag(args, flag)) findings.push(finding(rule))
    }
    for (const entry of rule.forbidFlagValues ?? []) {
      if (
        args.some((arg) => matchesFlag(arg, entry.flag) && entry.values.includes(arg.value ?? ''))
      ) {
        findings.push(finding(rule))
      }
    }
    if (rule.outputExtensions) {
      const exts = outputExtensionsOf(args)
      if (exts.length > 0 && !exts.some((ext) => rule.outputExtensions!.includes(ext))) {
        findings.push(finding(rule))
      }
    }
    const order = rule.order
    if (order) {
      const flagIndex = args.findIndex((arg) => matchesFlag(arg, order.flag))
      const beforeIndex = args.findIndex((arg) => matchesFlag(arg, order.before))
      if (flagIndex >= 0 && beforeIndex >= 0 && flagIndex < beforeIndex) {
        findings.push(finding(rule))
      }
    }
  }
  return findings
}
