import { describe, expect, it } from 'vitest'
import { bindRecipeValues } from '../../src/tui/binding.ts'
import type { Recipe } from '../../src/core/types.ts'

describe('bindRecipeValues', () => {
  it('replaces every {{key}} from values', () => {
    const recipe: Recipe = {
      id: 'trim',
      tool: 'ffmpeg',
      args: [
        { kind: 'option', name: 'ss', value: '{{start}}' },
        { kind: 'option', name: 't', value: '{{duration}}' },
        { kind: 'option', name: 'c:v', value: '{{preset}}' },
        { kind: 'option', name: 'crf', value: '{{crf}}' },
        { kind: 'value', name: 'input', value: '{{input}}' },
        { kind: 'option', name: 'vf', value: 'subtitles={{subs}}' },
        { kind: 'value', name: 'output', value: '{{output}}' },
      ],
    }

    const { args, findings } = bindRecipeValues(recipe, {
      start: '00:00:01',
      duration: '5',
      preset: 'libx264',
      crf: '23',
      input: 'in.mp4',
      subs: 'subs.srt',
      output: 'out.mp4',
    })

    expect(findings).toEqual([])
    expect(args).toEqual([
      { kind: 'option', name: 'ss', value: '00:00:01' },
      { kind: 'option', name: 't', value: '5' },
      { kind: 'option', name: 'c:v', value: 'libx264' },
      { kind: 'option', name: 'crf', value: '23' },
      { kind: 'value', name: 'input', value: 'in.mp4' },
      { kind: 'option', name: 'vf', value: 'subtitles=subs.srt' },
      { kind: 'value', name: 'output', value: 'out.mp4' },
    ])
  })

  it('returns UNBOUND_PLACEHOLDER for an unbound placeholder', () => {
    const recipe: Recipe = {
      id: 'trim',
      tool: 'ffmpeg',
      args: [
        { kind: 'value', name: 'input', value: '{{input}}' },
        { kind: 'option', name: 'ss', value: '{{start}}' },
        { kind: 'value', name: 'output', value: '{{output}}' },
      ],
    }

    const { args, findings } = bindRecipeValues(recipe, {
      input: 'in.mp4',
      output: 'out.mp4',
    })

    expect(args[1]).toEqual({ kind: 'option', name: 'ss', value: '{{start}}' })
    expect(findings).toHaveLength(1)
    expect(findings[0]?.code).toBe('UNBOUND_PLACEHOLDER')
    expect(findings[0]?.severity).toBe('error')
  })

  it('binds input and output', () => {
    const recipe: Recipe = {
      id: 'copy',
      tool: 'ffmpeg',
      args: [
        { kind: 'value', name: 'input', value: '{{input}}' },
        { kind: 'option', name: 'c', value: 'copy' },
        { kind: 'value', name: 'output', value: '{{output}}' },
      ],
    }

    const { args, findings } = bindRecipeValues(recipe, {
      input: 'source.mov',
      output: 'dest.mp4',
    })

    expect(findings).toEqual([])
    expect(args[0]).toEqual({ kind: 'value', name: 'input', value: 'source.mov' })
    expect(args[2]).toEqual({ kind: 'value', name: 'output', value: 'dest.mp4' })
  })

  it('binds audio and logo separately for a recipe with two inputs', () => {
    const recipe: Recipe = {
      id: 'overlay-audio-logo',
      tool: 'ffmpeg',
      args: [
        { kind: 'value', name: 'input', value: '{{input}}' },
        { kind: 'value', name: 'audio', value: '{{audio}}' },
        { kind: 'value', name: 'logo', value: '{{logo}}' },
        { kind: 'value', name: 'output', value: '{{output}}' },
      ],
    }

    const { args, findings } = bindRecipeValues(recipe, {
      input: 'video.mp4',
      audio: 'voice.wav',
      logo: 'brand.png',
      output: 'final.mp4',
    })

    expect(findings).toEqual([])
    expect(args[0]?.value).toBe('video.mp4')
    expect(args[1]?.value).toBe('voice.wav')
    expect(args[2]?.value).toBe('brand.png')
    expect(args[3]?.value).toBe('final.mp4')
  })
})
