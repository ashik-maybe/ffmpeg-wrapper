import { chmod, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { detectBinaries, parseVersion } from './detect'
import {
  compileRuntimeSpec,
  parseEncoders,
  parseFilters,
  parseHwaccels,
  parseMuxers,
  parseOptions,
  parsePixFmts,
  parseProtocols,
  parseSampleFmts,
} from './spec-runtime/compile'
import { validateAgainstRuntime } from './spec-runtime/validate'
import type { RuntimeSpec } from './spec-runtime/types'
import type { Recipe } from '../core/types'

const dirs: string[] = []

async function makeTmp(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'ffmpeg-tools-test-'))
  dirs.push(dir)
  return dir
}

afterEach(async () => {
  await Promise.all(dirs.splice(0).map((d) => rm(d, { recursive: true, force: true })))
})

async function makeFakeFfmpeg(dir: string, name = 'ffmpeg'): Promise<string> {
  const path = join(dir, name)
  const script = `#!/usr/bin/env bash
set -eu
case "\${1:-}" in
  -version)
    echo "ffmpeg version 7.1-test Copyright (c) 2000-2024"
    echo "built with gcc 14"
    ;;
  -h)
    echo "  -L                  show license"
    echo "  -i url              input file url"
    echo "  -c[:stream_spec] codec  codec name"
    echo "  -vf filter_graph    set video filters"
    ;;
  -filters)
    echo "Filters:"
    echo " T.. scale            V->V Scale the input video size"
    echo " ... hflip            V->V Horizontal flip"
    ;;
  -encoders)
    echo "Encoders:"
    echo " V..... libx264          libx264 H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10"
    echo " V..... h264_nvenc       NVIDIA NVENC H.264 encoder"
    echo " A..... aac              AAC (Advanced Audio Coding)"
    ;;
  -muxers)
    echo "Muxers:"
    echo "  E mp4             MP4 (MPEG-4 Part 14)"
    echo "  E matroska,webm   Matroska / WebM"
    ;;
  -demuxers)
    echo "Demuxers:"
    echo "  D mov,mp4,m4a,3gp QuickTime / MOV"
    ;;
  -protocols)
    echo "Supported file protocols:"
    echo "Input:"
    echo "  file http https"
    echo "Output:"
    echo "  file udp"
    ;;
  -hwaccels)
    echo "Hardware acceleration methods:"
    echo "cuda"
    echo "vaapi"
    ;;
  -pix_fmts)
    echo "Pixel formats:"
    echo "IO... yuv420p                3            12"
    echo "IO... nv12                   3            12"
    ;;
  -sample_fmts)
    echo "Sample formats:"
    echo "name   depth"
    echo "u8        8"
    echo "s16      16"
    ;;
  *)
    echo "unknown args: $*" >&2
    exit 1
    ;;
esac
`
  await writeFile(path, script, 'utf8')
  await chmod(path, 0o755)
  return path
}

async function makeFakeFfprobe(dir: string): Promise<string> {
  const path = join(dir, 'ffprobe')
  const script = `#!/usr/bin/env bash
if [ "\${1:-}" = "-version" ]; then
  echo "ffprobe version 7.1-test"
  exit 0
fi
exit 1
`
  await writeFile(path, script, 'utf8')
  await chmod(path, 0o755)
  return path
}

describe('detect', () => {
  it('parses version from ffmpeg output', () => {
    expect(parseVersion('ffmpeg version 6.1.1 Copyright')).toBe('6.1.1')
  })

  it('detects present binaries', async () => {
    const dir = await makeTmp()
    const ffmpeg = await makeFakeFfmpeg(dir)
    const ffprobe = await makeFakeFfprobe(dir)
    const result = await detectBinaries({ ffmpegPath: ffmpeg, ffprobePath: ffprobe })
    expect(result.ffmpeg?.version).toBe('7.1-test')
    expect(result.ffprobe?.version).toBe('7.1-test')
    expect(result.errors).toEqual([])
  })

  it('returns NOT_FOUND when absent', async () => {
    const result = await detectBinaries({
      ffmpegPath: '/definitely/missing/ffmpeg',
      ffprobePath: '/definitely/missing/ffprobe',
    })
    expect(result.ffmpeg).toBeUndefined()
    expect(result.ffprobe).toBeUndefined()
    expect(result.errors.map((e) => e.code)).toEqual(['NOT_FOUND', 'NOT_FOUND'])
  })
})

describe('spec-runtime parse', () => {
  it('parses options from help', () => {
    const out =
      '  -L                  show license\n  -i url              input\n  -c[:stream_spec] codec  codec name\n'
    expect(parseOptions(out)).toEqual(['L', 'c', 'i'])
  })
  it('parses filters', () => {
    expect(parseFilters(' T.. scale V->V Scale\n ... hflip V->V Flip')).toEqual(['hflip', 'scale'])
  })
  it('parses encoders', () => {
    expect(parseEncoders(' V..... libx264 desc\n A..... aac desc')).toEqual(['aac', 'libx264'])
  })
  it('parses muxers and demuxers', () => {
    expect(parseMuxers('  E mp4 MP4\n  E matroska,webm Matroska')).toEqual([
      'matroska',
      'mp4',
      'webm',
    ])
  })
  it('parses protocols', () => {
    expect(
      parseProtocols('Supported file protocols:\nInput:\n  file http\nOutput:\n  udp\n'),
    ).toEqual(['file', 'http', 'udp'])
  })
  it('parses hwaccels', () => {
    expect(parseHwaccels('Hardware acceleration methods:\ncuda\nvaapi\n')).toEqual([
      'cuda',
      'vaapi',
    ])
  })
  it('parses pix fmts', () => {
    expect(parsePixFmts('IO... yuv420p 3 12\nIO... nv12 3 12')).toEqual(['nv12', 'yuv420p'])
  })
  it('parses sample fmts', () => {
    expect(parseSampleFmts('name depth\nu8 8\ns16 16')).toEqual(['s16', 'u8'])
  })
})

describe('compileRuntimeSpec', () => {
  it('compiles and caches by version+sha256', async () => {
    const dir = await makeTmp()
    const ffmpeg = await makeFakeFfmpeg(dir)
    const cacheDir = join(dir, 'cache')
    const first = await compileRuntimeSpec(ffmpeg, { cacheDir })
    expect(first.spec.version).toBe('7.1-test')
    expect(first.spec.filters).toContain('scale')
    expect(first.spec.encoders).toContain('libx264')
    expect(first.spec.muxers).toContain('mp4')
    expect(first.spec.demuxers).toContain('mov')
    expect(first.spec.protocols).toContain('https')
    expect(first.spec.hwaccels).toContain('cuda')
    expect(first.spec.pixFmts).toContain('yuv420p')
    expect(first.spec.sampleFmts).toContain('s16')
    expect(first.provenance.cacheKey).toMatch(/^[a-f0-9]{64}$/)

    const second = await compileRuntimeSpec(ffmpeg, { cacheDir })
    expect(second.provenance.cacheKey).toBe(first.provenance.cacheKey)
    expect(second.provenance.generatedAt).toBe(first.provenance.generatedAt)
    expect(second.spec).toEqual(first.spec)
  })
})

describe('validateAgainstRuntime', () => {
  const spec: RuntimeSpec = {
    version: '7.1-test',
    options: ['i', 'c', 'vf', 'vn'],
    filters: ['scale'],
    encoders: ['libx264', 'aac'],
    muxers: ['mp4'],
    demuxers: ['mov'],
    protocols: ['file'],
    hwaccels: ['cuda'],
    pixFmts: ['yuv420p'],
    sampleFmts: ['s16'],
  }

  it('reports unknown flags', () => {
    const recipe: Recipe = {
      id: 'r1',
      tool: 'ffmpeg',
      args: [{ kind: 'option', name: 'bogus', value: '1' }],
    }
    const findings = validateAgainstRuntime(spec, recipe)
    expect(findings.some((f) => f.code === 'E_UNKNOWN_OPTION')).toBe(true)
  })

  it('reports missing encoder', () => {
    const recipe: Recipe = {
      id: 'r2',
      tool: 'ffmpeg',
      args: [{ kind: 'option', name: 'vcodec', value: 'libx265', alias: 'c:v' }],
    }
    const findings = validateAgainstRuntime(spec, recipe)
    expect(findings).toEqual([
      {
        severity: 'error',
        code: 'E_UNVERIFIED',
        message: 'Missing encoder: libx265',
        file: 'recipe:r2',
      },
    ])
  })

  it('marks hardware recipe unverified when encoder absent', () => {
    const recipe: Recipe = {
      id: 'nvenc',
      tool: 'ffmpeg',
      args: [{ kind: 'option', name: 'vcodec', value: 'h264_nvenc', alias: 'c:v' }],
    }
    const findings = validateAgainstRuntime(spec, recipe)
    expect(findings).toEqual([
      {
        severity: 'warning',
        code: 'E_UNVERIFIED',
        message: 'Hardware encoder unavailable, recipe unverified: h264_nvenc',
        file: 'recipe:nvenc',
      },
    ])
  })

  it('accepts known flags and encoders', () => {
    const recipe: Recipe = {
      id: 'ok',
      tool: 'ffmpeg',
      args: [
        { kind: 'value', name: 'input', value: 'in.mp4' },
        { kind: 'option', name: 'vcodec', value: 'libx264', alias: 'c:v' },
        { kind: 'flag', name: 'vn' },
      ],
    }
    expect(validateAgainstRuntime(spec, recipe)).toEqual([])
  })
})
