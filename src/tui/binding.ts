import type { Arg, Finding, Recipe } from '../core/types.ts'

const PLACEHOLDER_RE = /\{\{([^}]+)\}\}/g

function replaceTokens(text: string, values: Record<string, string>): string {
  let result = text
  for (const [key, value] of Object.entries(values)) {
    result = result.split(`{{${key}}}`).join(value)
  }
  return result
}

export function bindRecipeValues(
  recipe: Recipe,
  values: Record<string, string>,
): { args: Arg[]; findings: Finding[] } {
  const findings: Finding[] = []
  const seen = new Set<string>()

  const args = recipe.args.map((arg): Arg => {
    if (arg.value === undefined) return { ...arg }

    const value = replaceTokens(arg.value, values)
    for (const match of value.matchAll(PLACEHOLDER_RE)) {
      const token = match[1]
      if (token === undefined || seen.has(token)) continue
      seen.add(token)
      findings.push({
        severity: 'error',
        code: 'UNBOUND_PLACEHOLDER' as unknown as Finding['code'],
        message: `Unbound placeholder: {{${token}}}`,
        file: recipe.id,
      })
    }

    return { ...arg, value }
  })

  return { args, findings }
}
