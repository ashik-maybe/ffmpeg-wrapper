import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { optionDetails } from '../../src/spec/index'
import { recipes } from '../../src/recipes/index'

const root = resolve(import.meta.dirname, '../..')
const help = readFileSync(resolve(root, '.cache/ffmpeg-help.txt'), 'utf8')

const detailNames = new Set<string>()
for (const detail of optionDetails) {
  detailNames.add(detail.name)
  for (const alias of detail.aliases ?? []) detailNames.add(alias)
}

function isValidFlag(name: string): boolean {
  return detailNames.has(name) || help.includes(`-${name}`)
}

const missing = new Set<string>()
for (const recipe of recipes) {
  for (const arg of recipe.args) {
    if (arg.kind === 'value') continue
    if (!isValidFlag(arg.name)) missing.add(arg.name)
    if (arg.alias && !isValidFlag(arg.alias)) missing.add(arg.alias)
  }
}

if (missing.size > 0) {
  console.log(`missing flags: ${[...missing].sort().join(', ')}`)
}

describe('total coverage', () => {
  it('every emitted recipe flag is in option details, aliases, or ffmpeg-help.txt', () => {
    expect([...missing].sort()).toEqual([])
  })
})
