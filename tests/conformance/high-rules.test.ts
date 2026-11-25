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

describe('high-value validation rules', () => {
  it('rejects -movflags +faststart for non-mp4/mov/m4a output', () => {
    const findings = validate(
      plan([
        { kind: 'option', name: 'movflags', value: '+faststart' },
        { kind: 'value', name: 'output', value: 'out.mkv' },
      ]),
      spec,
    )
    expect(findings.some((f) => f.severity === 'error')).toBe(true)
  })

  it('allows -movflags +faststart for mp4 output', () => {
    const findings = validate(
      plan([
        { kind: 'option', name: 'movflags', value: '+faststart' },
        { kind: 'value', name: 'output', value: 'out.mp4' },
      ]),
      spec,
    )
    expect(findings.filter((f) => f.message.includes('faststart'))).toEqual([])
  })

  it('rejects -map_metadata -1 with -map_metadata 0', () => {
    const findings = validate(
      plan([
        { kind: 'option', name: 'map_metadata', value: '-1' },
        { kind: 'option', name: 'map_metadata', value: '0' },
      ]),
      spec,
    )
    expect(findings.some((f) => f.code === 'E_CONFLICT')).toBe(true)
  })

  it('reports error for -force_key_frames with -c copy', () => {
    const findings = validate(
      plan([
        { kind: 'option', name: 'force_key_frames', value: 'expr:gte(t,n_forced*2)' },
        { kind: 'option', name: 'c', value: 'copy' },
      ]),
      spec,
    )
    expect(findings.some((f) => f.severity === 'error' && f.code === 'E_CONFLICT')).toBe(true)
  })

  it('reports warning for -copyts with -avoid_negative_ts', () => {
    const findings = validate(
      plan([
        { kind: 'flag', name: 'copyts' },
        { kind: 'option', name: 'avoid_negative_ts', value: 'make_zero' },
      ]),
      spec,
    )
    expect(findings.some((f) => f.severity === 'warning')).toBe(true)
  })

  it('rejects -filter_complex_script with missing or empty value', () => {
    const findings = validate(
      plan([{ kind: 'option', name: 'filter_complex_script', value: '' }]),
      spec,
    )
    expect(findings.some((f) => f.severity === 'error')).toBe(true)
  })
})
