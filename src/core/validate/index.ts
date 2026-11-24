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
  readonly valueConstraint?: ValueConstraint
  readonly order?: { readonly flag: string; readonly before: string }
}

/**
 * Value constraint of a rule: a forbidden value set, a required value
 * set, or a numeric range.
 */
interface ValueConstraint {
  readonly oneOf?: readonly string[]
  readonly notOneOf?: readonly string[]
  readonly min?: number
  readonly max?: number
}

const rules = (rulesData as { rules: Rule[] }).rules
const findingFile = 'src/core/validate/index.ts'

function matchesFlag(arg: Arg, flag: string): boolean {
  return arg.name === flag || arg.alias === flag
}

function findArg(args: readonly Arg[], flag: string): Arg | undefined {
  return args.find((arg) => matchesFlag(arg, flag))
}

function hasFlag(args: readonly Arg[], flag: string): boolean {
  return findArg(args, flag) !== undefined
}

function violates(value: string, constraint: ValueConstraint): boolean {
  const oneOf = constraint.oneOf
  const notOneOf = constraint.notOneOf
  if (oneOf !== undefined || notOneOf !== undefined) {
    if (oneOf !== undefined && oneOf.includes(value)) return true
    if (notOneOf !== undefined && !notOneOf.includes(value)) return true
    return false
  }
  const number = Number(value)
  if (Number.isNaN(number)) return true
  if (constraint.min !== undefined && number < constraint.min) return true
  if (constraint.max !== undefined && number > constraint.max) return true
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

/**
 * Validate a plan against a tool spec and return the findings.
 */
export function validate(plan: Plan, spec: ToolSpec): Finding[] {
  void spec
  const findings: Finding[] = []
  const args = plan.args
  for (const rule of rules) {
    if (rule.requireAny && !rule.requireAny.some((flag) => hasFlag(args, flag))) continue
    if (rule.valueConstraint) {
      for (const flag of rule.requireAny ?? []) {
        const arg = findArg(args, flag)
        if (arg?.value !== undefined && violates(arg.value, rule.valueConstraint)) {
          findings.push(finding(rule))
        }
      }
    }
    for (const flag of rule.requireAll ?? []) {
      if (!hasFlag(args, flag)) findings.push(finding(rule))
    }
    for (const flag of rule.forbidAny ?? []) {
      if (hasFlag(args, flag)) findings.push(finding(rule))
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
