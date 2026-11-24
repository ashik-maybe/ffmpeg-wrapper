import { describe, expect, it } from 'vitest'
import { quote } from '../../src/core/render/quote.ts'
import { render } from '../../src/core/render/index.ts'
import { recipes } from '../../src/recipes/index.ts'
import type { Command } from '../../src/core/types.ts'

describe('ffmpeg command regressions', () => {
  it('writes -i before every input file', () => {
    const recipe = recipes.find((item) => item.id === 'web-h264')
    expect(recipe).toBeDefined()
    if (recipe === undefined) return
    const command: Command = { tool: 'ffmpeg', args: recipe.args }
    const text = render(command, 'posix')
    expect(text).toContain('-i')
    expect(text).toMatch(/-i '?\{\{input\}\}'?/)
  })

  it('escapes cmd quotes without adding carets inside double quotes', () => {
    expect(quote('a"b', 'cmd')).toBe('"a""b"')
    expect(quote('a^b', 'cmd')).toBe('"a^b"')
    expect(quote('a&b', 'cmd')).toBe('"a&b"')
  })

  it('refuses newlines in cmd values', () => {
    expect(() => quote('a\nb', 'cmd')).toThrow(/newline/i)
  })
})
