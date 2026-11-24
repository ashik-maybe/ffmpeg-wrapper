import type { Finding, Plan, ToolSpec } from '../types'

/**
 * Validate a plan against a tool spec and return the findings.
 */
export function validate(plan: Plan, spec: ToolSpec): Finding[] {
  void plan
  void spec
  throw new Error('NotImplemented: validate')
}
