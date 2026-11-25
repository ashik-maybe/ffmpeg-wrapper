import { describe, expect, it } from 'vitest'
import type { Recipe } from '../core/types'
import recipesData from '../data/recipes.json'
import recipesExtraData from '../data/recipes-extra.json'
import recipesAdvancedData from '../data/recipes-advanced.json'
import highA from '../data/recipes-high-a.json'
import highB from '../data/recipes-high-b.json'
import highC from '../data/recipes-high-c.json'
import highD from '../data/recipes-high-d.json'
import { recipes } from './index'

const sets = [
  (recipesData as { recipes: Recipe[] }).recipes,
  (recipesExtraData as { recipes: Recipe[] }).recipes,
  (recipesAdvancedData as { recipes: Recipe[] }).recipes,
  (highA as { recipes: Recipe[] }).recipes,
  (highB as { recipes: Recipe[] }).recipes,
  (highC as { recipes: Recipe[] }).recipes,
  (highD as { recipes: Recipe[] }).recipes,
]

describe('recipes loader', () => {
  it('merges all recipe sets', () => {
    const ids = sets.flat().map((recipe) => recipe.id)
    expect(recipes.length).toBe(new Set(ids).size)
  })

  it('keeps every unique id', () => {
    const ids = recipes.map((recipe) => recipe.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps one recipe per duplicated id', () => {
    for (const id of ['hls', 'rotate']) {
      expect(recipes.filter((recipe) => recipe.id === id)).toHaveLength(1)
      expect(recipes.find((recipe) => recipe.id === id)).toEqual(
        sets[0].find((recipe) => recipe.id === id),
      )
    }
  })

  it('includes recipes from the extra and advanced sets', () => {
    expect(recipes.some((recipe) => recipe.id === 'dash')).toBe(true)
    expect(recipes.some((recipe) => recipe.id === 'av1-svt')).toBe(true)
  })
})
