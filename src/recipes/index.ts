import recipesData from '../data/recipes.json'
import recipesExtraData from '../data/recipes-extra.json'
import recipesAdvancedData from '../data/recipes-advanced.json'
import recipesHighAData from '../data/recipes-high-a.json'
import recipesHighBData from '../data/recipes-high-b.json'
import recipesHighCData from '../data/recipes-high-c.json'
import recipesHighDData from '../data/recipes-high-d.json'
import type { Plan, Recipe, Shell } from '../core/types'

const sets = [
  (recipesData as { recipes: Recipe[] }).recipes,
  (recipesExtraData as { recipes: Recipe[] }).recipes,
  (recipesAdvancedData as { recipes: Recipe[] }).recipes,
  (recipesHighAData as { recipes: Recipe[] }).recipes,
  (recipesHighBData as { recipes: Recipe[] }).recipes,
  (recipesHighCData as { recipes: Recipe[] }).recipes,
  (recipesHighDData as { recipes: Recipe[] }).recipes,
]

/**
 * Merge recipe sets, keeping the first recipe per id.
 */
function mergeBy(inputs: Recipe[][]): Recipe[] {
  const seen = new Set<string>()
  const merged: Recipe[] = []
  for (const recipe of inputs.flat()) {
    if (seen.has(recipe.id)) continue
    seen.add(recipe.id)
    merged.push(recipe)
  }
  return merged
}

const recipes = mergeBy(sets)

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
