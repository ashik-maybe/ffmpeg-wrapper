import type { Plan, Recipe } from './types'

/** Replace every `{{key}}` placeholder in an arg value. */
function substitute(text: string, values: Record<string, string>): string {
  let result = text
  for (const key of Object.keys(values)) {
    result = result.split(`{{${key}}}`).join(values[key])
  }
  return result
}

/** Build a plan from a recipe and the user's values. */
export function planFromRecipe(recipe: Recipe, values: Record<string, string>): Plan {
  const args = recipe.args.map((arg) =>
    arg.value === undefined ? arg : { ...arg, value: substitute(arg.value, values) },
  )
  return { recipe: { ...recipe, args }, args }
}
