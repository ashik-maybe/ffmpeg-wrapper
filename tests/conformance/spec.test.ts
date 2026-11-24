import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import recipesData from '../../src/data/recipes.json'
import spec from '../../src/spec/options.json'

const root = resolve(import.meta.dirname, '../..')
const help = readFileSync(resolve(root, '.cache/ffmpeg-help.txt'), 'utf8')
const filtersTxt = readFileSync(resolve(root, '.cache/ffmpeg-filters.txt'), 'utf8')

describe('spec conformance', () => {
  it('provenance version equals 9.1', () => {
    expect(spec.provenance.version).toBe('9.1')
  })

  it('filters count is above 400', () => {
    const sep = filtersTxt.indexOf('------')
    const body = sep >= 0 ? filtersTxt.slice(sep + '------'.length) : filtersTxt
    const count = body.split('\n').filter((line) => line.trim().length > 0).length
    expect(count).toBeGreaterThan(400)
  })

  describe('recipe bare flag names appear in ffmpeg-help.txt', () => {
    for (const recipe of recipesData.recipes) {
      for (const arg of recipe.args) {
        if (arg.kind === 'value') continue
        it(`${recipe.id}: -${arg.name}`, () => {
          expect(help).toContain(`-${arg.name}`)
        })
      }
    }
  })
})
