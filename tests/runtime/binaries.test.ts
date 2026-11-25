// @vitest-environment node

import { execFile as execFileCb } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { render } from '../../src/core/render/index.ts'
import type { Command } from '../../src/core/types.ts'
import { recipes, toPlan } from '../../src/recipes/index.ts'

const execFile = promisify(execFileCb)

const repoRoot = resolve(import.meta.dirname, '../..')
const ffmpegPath = join(repoRoot, 'tools/bin/ffmpeg')
const ffprobePath = join(repoRoot, 'tools/bin/ffprobe')
const binariesExist = existsSync(ffmpegPath) && existsSync(ffprobePath)

const describeRuntime = binariesExist ? describe : describe.skip

function run(cmd: string, args: string[], cwd?: string) {
  return execFile(cmd, args, { cwd, maxBuffer: 10 * 1024 * 1024 })
}

function runShell(command: string, cwd?: string) {
  return execFile('/bin/bash', ['-c', command], {
    cwd,
    maxBuffer: 10 * 1024 * 1024,
  })
}

async function ffprobeJson(file: string) {
  const { stdout } = await run(ffprobePath, [
    '-v',
    'error',
    '-show_entries',
    'format=duration:stream=codec_name,codec_type',
    '-of',
    'json',
    file,
  ])
  return JSON.parse(stdout) as {
    streams?: Array<{ codec_name?: string; codec_type?: string }>
    format?: { duration?: string }
  }
}

function hasCopyWithFilter(command: Command): boolean {
  const hasCopy = command.args.some(
    (arg) =>
      arg.kind === 'option' &&
      (arg.name === 'c' || arg.alias === 'c' || arg.name === 'c:v' || arg.name === 'c:a') &&
      arg.value === 'copy',
  )
  const hasFilter = command.args.some(
    (arg) =>
      arg.kind === 'option' &&
      (arg.name === 'vf' || arg.name === 'af' || arg.name === 'filter_complex'),
  )
  return hasCopy && hasFilter
}

describeRuntime('pinned ffmpeg runtime', () => {
  let dir = ''
  let clip = ''
  const renderedCommands: string[] = []
  const builtCommands: Command[] = []

  beforeAll(async () => {
    dir = mkdtempSync(join(tmpdir(), 'ffmpeg-runtime-'))
    clip = join(dir, 'clip.mkv')
    await run(ffmpegPath, [
      '-y',
      '-f',
      'lavfi',
      '-i',
      'testsrc=duration=1:size=64x64:rate=5',
      '-f',
      'lavfi',
      '-i',
      'sine=frequency=440:duration=1',
      '-shortest',
      clip,
    ])
  }, 60_000)

  afterAll(() => {
    if (dir) rmSync(dir, { recursive: true, force: true })
  })

  it('reports pinned binary versions', async () => {
    const ffmpegVersion = await run(ffmpegPath, ['-version'])
    const ffprobeVersion = await run(ffprobePath, ['-version'])
    expect(ffmpegVersion.stdout.split('\n')[0]).toMatch(/^ffmpeg version 9\.1/)
    expect(ffprobeVersion.stdout.split('\n')[0]).toMatch(/^ffprobe version 9\.1/)
  })

  it('extracts audio to m4a with -vn', async () => {
    const output = join(dir, 'audio.m4a')
    const command: Command = {
      tool: ffmpegPath,
      args: [
        { kind: 'flag', name: 'y' },
        { kind: 'option', name: 'i', value: clip },
        { kind: 'flag', name: 'vn' },
        { kind: 'option', name: 'c:a', value: 'aac' },
        { kind: 'value', name: 'output', value: output },
      ],
    }
    builtCommands.push(command)
    const rendered = render(command, 'posix')
    renderedCommands.push(rendered)
    await runShell(rendered)

    const probe = await ffprobeJson(output)
    const streams = probe.streams ?? []
    expect(streams).toHaveLength(1)
    expect(streams[0]?.codec_type).toBe('audio')
    expect(streams[0]?.codec_name).toBe('aac')
    const duration = Number(probe.format?.duration ?? '0')
    expect(duration).toBeGreaterThan(0.9)
    expect(duration).toBeLessThan(1.2)
  }, 60_000)

  it('trims with -ss and -t', async () => {
    const output = join(dir, 'trim.mkv')
    const command: Command = {
      tool: ffmpegPath,
      args: [
        { kind: 'flag', name: 'y' },
        { kind: 'option', name: 'ss', value: '0' },
        { kind: 'option', name: 't', value: '1' },
        { kind: 'option', name: 'i', value: clip },
        { kind: 'option', name: 'c:v', value: 'libx264' },
        { kind: 'option', name: 'c:a', value: 'aac' },
        { kind: 'value', name: 'output', value: output },
      ],
    }
    builtCommands.push(command)
    const rendered = render(command, 'posix')
    renderedCommands.push(rendered)
    await runShell(rendered)

    const probe = await ffprobeJson(output)
    const streams = probe.streams ?? []
    expect(streams.length).toBeGreaterThanOrEqual(2)
    const codecs = streams.map((s) => s.codec_name)
    expect(codecs).toContain('h264')
    expect(codecs).toContain('aac')
    const duration = Number(probe.format?.duration ?? '0')
    expect(duration).toBeGreaterThan(0.9)
    expect(duration).toBeLessThan(1.2)
  }, 60_000)

  it('makes a gif', async () => {
    const output = join(dir, 'out.gif')
    const command: Command = {
      tool: ffmpegPath,
      args: [
        { kind: 'flag', name: 'y' },
        { kind: 'option', name: 'i', value: clip },
        { kind: 'option', name: 'vf', value: 'fps=5,scale=64:-1:flags=lanczos' },
        { kind: 'value', name: 'output', value: output },
      ],
    }
    builtCommands.push(command)
    const rendered = render(command, 'posix')
    renderedCommands.push(rendered)
    await runShell(rendered)

    const probe = await ffprobeJson(output)
    const streams = probe.streams ?? []
    expect(streams.length).toBeGreaterThanOrEqual(1)
    expect(streams[0]?.codec_name).toBe('gif')
    const duration = Number(probe.format?.duration ?? '0')
    expect(duration).toBeGreaterThan(0.8)
    expect(duration).toBeLessThan(1.3)
  }, 60_000)

  it('puts replace-audio options before the output operand', () => {
    const recipe = recipes.find((r) => r.id === 'replace-audio')
    expect(recipe).toBeDefined()
    const output = join(dir, 'replaced.mp4')
    const plan = toPlan(recipe!, { input: clip, audio: join(dir, 'audio.m4a'), output }, 'posix')
    const rendered = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')
    const outputToken = `'${output}'`
    const outputIndex = rendered.indexOf(outputToken)
    expect(outputIndex).toBeGreaterThan(-1)
    expect(rendered.slice(outputIndex + outputToken.length).trim()).toBe('')
    for (const option of ['-map', '-c']) {
      expect(rendered).toContain(option)
      expect(rendered.indexOf(option)).toBeLessThan(outputIndex)
    }
  })

  it('builds no command that uses -c copy together with a filter', () => {
    expect(builtCommands.length).toBeGreaterThan(0)
    for (const command of builtCommands) {
      expect(hasCopyWithFilter(command)).toBe(false)
    }
    for (const rendered of renderedCommands) {
      const hasCopy = /(?:^|\s)-c(?::[avs])?\s+'copy'/.test(rendered)
      const hasFilter = /(?:^|\s)-(?:vf|af|filter_complex)\s+/.test(rendered)
      expect(hasCopy && hasFilter).toBe(false)
    }
  })
})
