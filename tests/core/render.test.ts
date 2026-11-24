import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import hostileNames from '../fixtures/hostile-names.json'
import recipesData from '../../src/data/recipes.json'
import { render } from '../../src/core/render/index'
import { quote } from '../../src/core/render/quote'
import type { Command, Shell } from '../../src/core/types'

const shells: Shell[] = ['posix', 'powershell', 'cmd']

function recipeCommand(args: Command['args']): Command {
  return { tool: 'ffmpeg', args }
}

describe('hostile filename rendering', () => {
  for (const shell of shells) {
    describe(shell, () => {
      for (const name of hostileNames) {
        it(`contains escaped name: ${JSON.stringify(name)}`, () => {
          const command: Command = {
            tool: 'ffmpeg',
            args: [
              { kind: 'option', name: 'i', value: name },
              { kind: 'value', name: 'output', value: 'out.mp4' },
            ],
          }
          const rendered = render(command, shell)
          expect(rendered).toContain(quote(name, shell))
        })
      }
    })
  }
})

describe('bash -n syntax check', () => {
  const sample = hostileNames.slice(0, 5)
  for (const name of sample) {
    it(`passes bash -n: ${JSON.stringify(name)}`, () => {
      const command: Command = {
        tool: 'ffmpeg',
        args: [
          { kind: 'option', name: 'i', value: name },
          { kind: 'value', name: 'output', value: 'out.mp4' },
        ],
      }
      const rendered = render(command, 'posix')
      execFileSync('bash', ['-n', '-c', rendered], { stdio: 'pipe' })
    })
  }
})

describe('no undefined in rendered commands', () => {
  for (const shell of shells) {
    for (const recipe of recipesData.recipes) {
      it(`${recipe.id} (${shell}) has no undefined`, () => {
        const rendered = render(recipeCommand(recipe.args as Command['args']), shell)
        expect(rendered).not.toContain('undefined')
      })
    }
    for (const name of hostileNames) {
      it(`hostile ${JSON.stringify(name)} (${shell}) has no undefined`, () => {
        const command: Command = {
          tool: 'ffmpeg',
          args: [
            { kind: 'option', name: 'i', value: name },
            { kind: 'value', name: 'output', value: 'out.mp4' },
          ],
        }
        expect(render(command, shell)).not.toContain('undefined')
      })
    }
  }
})
