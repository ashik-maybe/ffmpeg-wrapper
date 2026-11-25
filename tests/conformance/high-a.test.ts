import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import data from '../../src/data/recipes-high-a.json'

const root = resolve(import.meta.dirname, '../..')
const help = readFileSync(resolve(root, '.cache/ffmpeg-help.txt'), 'utf8')

const recipes = (
  data as { recipes: Array<{ id: string; args: Array<{ kind: string; name: string }> }> }
).recipes

describe('high-a recipes', () => {
  it('has unique ids', () => {
    const ids = recipes.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  describe('each recipe flag exists in cached help', () => {
    for (const recipe of recipes) {
      for (const arg of recipe.args) {
        if (arg.kind === 'value') continue
        it(`${recipe.id}: -${arg.name}`, () => {
          const base = arg.name.split(':')[0]
          expect(help).toContain(`-${base}`)
        })
      }
    }
  })
})
