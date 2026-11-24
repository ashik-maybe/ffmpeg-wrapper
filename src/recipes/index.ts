import recipesData from '../data/recipes.json'
import type { Plan, Recipe, Shell } from '../core/types'

const recipes = (recipesData as { recipes: Recipe[] }).recipes

/**
 * Replace every `{{key}}` placeholder in an arg's value with values[key].
 */
function substitute(text: string, values: Record<string, string>): string {
  let result = text
  for (const key of Object.keys(values)) {
    result = result.split(`{{${key}}}`).join(values[key])
  }
  return result
}

/**
 * Return the recipe as a plan with the user's values substituted in.
 */
export function toPlan(recipe: Recipe, values: Record<string, string>, shell: Shell): Plan {
  void shell
  const args = recipe.args.map((arg) =>
    arg.value === undefined ? arg : { ...arg, value: substitute(arg.value, values) },
  )
  return { recipe: { ...recipe, args }, args }
}

export { recipes }
