import { describe, expect, it } from 'vitest'
import { parseBuildOutput, summarize } from './parse'

const VERSION_FIXTURE = [
  'ffmpeg version 9.1 Copyright (c) 2000-2026 the FFmpeg developers',
  '  built with gcc 12 (Debian 12.2.0-14+deb12u1)',
  '  libavutil      61. 19.100 / 61. 19.100',
].join('\n')

const ENCODERS_FIXTURE = [
  'Encoders:',
  ' V....D aac                  AAC (Advanced Audio Coding)',
  ' V....D a64multi             Multicolor charset for Commodore 64 (codec a64_multi)',
  ' ------',
].join('\n')

const FILTERS_FIXTURE = [
  'Filters:',
  '  T.. = Timeline support',
  '  ------',
  'TS aap               AA->A      Apply Affine Projection algorithm to first audio stream.',
  ' .. abench            A->A       Benchmark part of a filtergraph.',
  ' .. bogusfilter       A->A       Not real.',
].join('\n')

describe('parseBuildOutput', () => {
  it('parses the version token', () => {
    expect(parseBuildOutput(VERSION_FIXTURE).version).toBe('9.1')
  })

  it('collects encoder names in file order', () => {
    expect(parseBuildOutput(ENCODERS_FIXTURE).encoders).toEqual(['aac', 'a64multi'])
  })

  it('collects filter names in file order', () => {
    expect(parseBuildOutput(FILTERS_FIXTURE).filters).toEqual(['aap', 'abench', 'bogusfilter'])
  })

  it('reports empty lists for empty text', () => {
    const values = parseBuildOutput('   ')
    expect(values.version).toBeUndefined()
    expect(values.encoders).toEqual([])
    expect(values.filters).toEqual([])
  })
})

describe('summarize', () => {
  it('matches when the version equals the spec version', () => {
    const summary = summarize(parseBuildOutput(VERSION_FIXTURE))
    expect(summary.version).toBe('9.1')
    expect(summary.versionMatch).toBe(true)
  })

  it('excludes encoders and filters the spec provides', () => {
    const summary = summarize(parseBuildOutput(ENCODERS_FIXTURE + '\n' + FILTERS_FIXTURE))
    expect(summary.missingEncoders).not.toContain('aac')
    expect(summary.missingEncoders).not.toContain('a64multi')
    expect(summary.missingFilters).not.toContain('aap')
    expect(summary.missingFilters).not.toContain('abench')
  })

  it('reports spec names absent from a build that lists none', () => {
    const summary = summarize(parseBuildOutput('Encoders:\n'))
    expect(summary.found).toBe(false)
    expect(summary.missingEncoders.length).toBeGreaterThan(0)
  })
})
