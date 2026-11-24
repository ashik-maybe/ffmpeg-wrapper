import { describe, expect, it } from 'vitest'
import { validate } from '../../src/core/validate/index.ts'
import type { Arg, Plan, ToolSpec } from '../../src/core/types.ts'

const spec: ToolSpec = {
  tool: 'ffmpeg',
  version: '9.1',
  options: [],
}

function plan(args: Arg[]): Plan {
  const recipe = { id: 'probe', tool: 'ffmpeg', args }
  return { recipe, args }
}

describe('ffmpeg validator rules', () => {
  it('does not warn on a normal single-input encode', () => {
    const findings = validate(
      plan([
        { kind: 'option', name: 'i', value: 'in.mp4' },
        { kind: 'option', name: 'vcodec', value: 'libx264' },
        { kind: 'option', name: 'crf', value: '23' },
        { kind: 'value', name: 'output', value: 'out.mp4' },
      ]),
      spec,
    )
    expect(findings).toEqual([])
  })

  it('still rejects crf with b:v', () => {
    const findings = validate(
      plan([
        { kind: 'option', name: 'crf', value: '23' },
        { kind: 'option', name: 'b:v', value: '1M' },
      ]),
      spec,
    )
    expect(findings.length).toBeGreaterThan(0)
  })
})
