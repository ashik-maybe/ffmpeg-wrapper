import type { Plan, Recipe } from './types'

/**
 * Build a plan from a recipe and the user's values.
 */
export function planFromRecipe(recipe: Recipe, values: Record<string, string>): Plan {
  void recipe
  void values
  throw new Error('NotImplemented: planFromRecipe')
}
