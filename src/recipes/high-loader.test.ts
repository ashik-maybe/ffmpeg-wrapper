import { describe, expect, it } from 'vitest'
import recipesData from '../data/recipes.json'
import recipesExtraData from '../data/recipes-extra.json'
import recipesAdvancedData from '../data/recipes-advanced.json'
import recipesHighAData from '../data/recipes-high-a.json'
import recipesHighBData from '../data/recipes-high-b.json'
import recipesHighCData from '../data/recipes-high-c.json'
import recipesHighDData from '../data/recipes-high-d.json'
import type { Recipe } from '../core/types'
import { recipes } from './index.ts'

const sets: Recipe[][] = [
  (recipesData as { recipes: Recipe[] }).recipes,
  (recipesExtraData as { recipes: Recipe[] }).recipes,
  (recipesAdvancedData as { recipes: Recipe[] }).recipes,
  (recipesHighAData as { recipes: Recipe[] }).recipes,
  (recipesHighBData as { recipes: Recipe[] }).recipes,
  (recipesHighCData as { recipes: Recipe[] }).recipes,
  (recipesHighDData as { recipes: Recipe[] }).recipes,
]

describe('high recipe loader', () => {
  it('merges all recipe sets by id', () => {
    const ids = new Set<string>()
    for (const recipe of sets.flat()) ids.add(recipe.id)
    expect(recipes).toHaveLength(ids.size)
  })

  it('has no duplicate ids', () => {
    const ids = recipes.map((recipe) => recipe.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
