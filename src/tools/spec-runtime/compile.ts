import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { parseVersion } from '../detect'
import type { CompiledRuntimeSpec, RuntimeSpec } from './types'

const execFileAsync = promisify(execFile)

const ARGS: readonly { key: keyof RuntimeSpec; args: readonly string[] }[] = [
  { key: 'options', args: ['-h', 'full'] },
  { key: 'filters', args: ['-filters'] },
  { key: 'encoders', args: ['-encoders'] },
  { key: 'muxers', args: ['-muxers'] },
  { key: 'demuxers', args: ['-demuxers'] },
  { key: 'protocols', args: ['-protocols'] },
  { key: 'hwaccels', args: ['-hwaccels'] },
  { key: 'pixFmts', args: ['-pix_fmts'] },
  { key: 'sampleFmts', args: ['-sample_fmts'] },
]

export interface CompileRuntimeSpecOptions {
  readonly cacheDir?: string
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

async function run(ffmpegPath: string, args: readonly string[]): Promise<string> {
  const { stdout, stderr } = await execFileAsync(ffmpegPath, [...args], {
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  })
  return `${stdout}\n${stderr}`
}

export function parseOptions(helpOutput: string): string[] {
  const names = new Set<string>()
  for (const line of helpOutput.split(/\r?\n/)) {
    const match = line.match(/^\s*-([A-Za-z0-9][A-Za-z0-9_-]*)(?=[[:\s,<]|$)/)
    if (match?.[1]) names.add(match[1])
  }
  return [...names].sort()
}

export function parseFilters(output: string): string[] {
  const names = new Set<string>()
  for (const line of output.split(/\r?\n/)) {
    const m = line.match(/^\s*[TSC.]{3}\s+([A-Za-z0-9_]+)\s+/)
    if (m?.[1]) names.add(m[1])
  }
  return [...names].sort()
}

export function parseEncoders(output: string): string[] {
  const names = new Set<string>()
  for (const line of output.split(/\r?\n/)) {
    const m = line.match(/^\s*[VASFXBD.]{6}\s+([A-Za-z0-9_][A-Za-z0-9_.-]*)\s+/)
    if (m?.[1]) names.add(m[1])
  }
  return [...names].sort()
}

export function parseMuxers(output: string): string[] {
  const names = new Set<string>()
  for (const line of output.split(/\r?\n/)) {
    const m = line.match(/^\s*[DE .]{2}\s+([A-Za-z0-9_][A-Za-z0-9_,.-]*)\s+/)
    if (m?.[1]) for (const n of m[1].split(',')) names.add(n.trim())
  }
  return [...names].sort()
}

export function parseDemuxers(output: string): string[] {
  return parseMuxers(output)
}

export function parseProtocols(output: string): string[] {
  const names = new Set<string>()
  let inSection = false
  for (const line of output.split(/\r?\n/)) {
    if (/protocols:/i.test(line)) {
      inSection = true
      continue
    }
    if (!inSection) continue
    for (const token of line.trim().split(/\s+/)) {
      if (/^[A-Za-z0-9][A-Za-z0-9+.-]*$/.test(token)) names.add(token)
    }
  }
  return [...names].sort()
}

export function parseHwaccels(output: string): string[] {
  const names = new Set<string>()
  for (const line of output.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_][A-Za-z0-9_.-]*)\s*$/)
    if (m?.[1] && m[1] !== 'Hardware' && m[1] !== 'acceleration' && m[1] !== 'methods:') {
      names.add(m[1])
    }
  }
  return [...names].sort()
}

export function parsePixFmts(output: string): string[] {
  const names = new Set<string>()
  for (const line of output.split(/\r?\n/)) {
    const m = line.match(/^\s*[IOHPB.]{5}\s+([A-Za-z0-9_]+)\s+/)
    if (m?.[1]) names.add(m[1])
  }
  return [...names].sort()
}

export function parseSampleFmts(output: string): string[] {
  const names = new Set<string>()
  for (const line of output.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9]+)\s+\d+/)
    if (m?.[1] && m[1] !== 'name') names.add(m[1])
  }
  return [...names].sort()
}

function parseByKey(key: keyof RuntimeSpec, output: string): string[] {
  switch (key) {
    case 'options':
      return parseOptions(output)
    case 'filters':
      return parseFilters(output)
    case 'encoders':
      return parseEncoders(output)
    case 'muxers':
      return parseMuxers(output)
    case 'demuxers':
      return parseDemuxers(output)
    case 'protocols':
      return parseProtocols(output)
    case 'hwaccels':
      return parseHwaccels(output)
    case 'pixFmts':
      return parsePixFmts(output)
    case 'sampleFmts':
      return parseSampleFmts(output)
    default:
      return []
  }
}

function cacheFile(cacheDir: string, cacheKey: string): string {
  return join(cacheDir, `${cacheKey}.json`)
}

export async function compileRuntimeSpec(
  ffmpegPath = 'ffmpeg',
  options: CompileRuntimeSpecOptions = {},
): Promise<CompiledRuntimeSpec> {
  const versionOutput = await run(ffmpegPath, ['-version'])
  const version = parseVersion(versionOutput) ?? 'unknown'
  const outputs: Record<string, string> = {}
  for (const entry of ARGS) {
    outputs[entry.key] = await run(ffmpegPath, entry.args)
  }
  const outputHashes = Object.fromEntries(Object.entries(outputs).map(([k, v]) => [k, sha256(v)]))
  const cacheKey = sha256(JSON.stringify({ version, outputHashes }))
  const cacheDir = options.cacheDir ?? join(tmpdir(), 'ffmpeg-tui-spec-cache')
  await mkdir(cacheDir, { recursive: true })
  const file = cacheFile(cacheDir, cacheKey)

  try {
    const cached = JSON.parse(await readFile(file, 'utf8')) as CompiledRuntimeSpec
    if (cached.provenance.cacheKey === cacheKey) return cached
  } catch {
    // cache miss
  }

  const spec: RuntimeSpec = {
    version,
    options: parseByKey('options', outputs.options),
    filters: parseByKey('filters', outputs.filters),
    encoders: parseByKey('encoders', outputs.encoders),
    muxers: parseByKey('muxers', outputs.muxers),
    demuxers: parseByKey('demuxers', outputs.demuxers),
    protocols: parseByKey('protocols', outputs.protocols),
    hwaccels: parseByKey('hwaccels', outputs.hwaccels),
    pixFmts: parseByKey('pixFmts', outputs.pixFmts),
    sampleFmts: parseByKey('sampleFmts', outputs.sampleFmts),
  }

  const compiled: CompiledRuntimeSpec = {
    spec,
    provenance: {
      version,
      generatedAt: new Date().toISOString(),
      cacheKey,
      outputs: outputHashes,
    },
  }
  await writeFile(file, JSON.stringify(compiled), 'utf8')
  return compiled
}
