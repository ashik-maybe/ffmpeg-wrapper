import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Recipe } from '../../src/core/types.ts'
import capabilities from '../../src/data/capabilities.json'
import recipesAdvancedData from '../../src/data/recipes-advanced.json'
import recipesExtraData from '../../src/data/recipes-extra.json'
import filterDetails from '../../src/spec/filter-details.json'

const root = resolve(import.meta.dirname, '../..')
const help = readFileSync(resolve(root, '.cache/ffmpeg-help.txt'), 'utf8')

const extraRecipes = (recipesExtraData as { recipes: Recipe[] }).recipes
const advancedRecipes = (recipesAdvancedData as { recipes: Recipe[] }).recipes

describe('new recipe sets', () => {
  it('extra and advanced both have recipes', () => {
    expect(extraRecipes.length).toBeGreaterThan(0)
    expect(advancedRecipes.length).toBeGreaterThan(0)
  })

  describe('bare flags of the new recipes appear in ffmpeg-help.txt', () => {
    for (const recipes of [extraRecipes, advancedRecipes]) {
      for (const recipe of recipes) {
        for (const arg of recipe.args) {
          if (arg.kind === 'value') continue
          it(`${recipe.id}: -${arg.name}`, () => {
            expect(help).toContain(`-${arg.name}`)
          })
        }
      }
    }
  })

  describe('capabilities cover at least 190 encoders', () => {
    it('encoders count is at least 190', () => {
      expect(capabilities.encoders.length).toBeGreaterThanOrEqual(190)
    })
  })

  describe('filter details cover at least 480 filters', () => {
    it('filters count is at least 480', () => {
      expect(filterDetails.filters.length).toBeGreaterThanOrEqual(480)
    })
  })
})
