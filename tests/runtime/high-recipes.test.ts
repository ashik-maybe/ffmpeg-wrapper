// @vitest-environment node

import { execFile as execFileCb } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { render } from '../../src/core/render/index.ts'
import type { Arg } from '../../src/core/types.ts'
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
    'format=duration:format_tags=title:stream=codec_name,codec_type:stream_tags=language',
    '-of',
    'json',
    file,
  ])
  return JSON.parse(stdout) as {
    streams?: Array<{ codec_name?: string; codec_type?: string; tags?: Record<string, string> }>
    format?: { duration?: string; tags?: Record<string, string> }
  }
}

function renderRecipe(id: string, values: Record<string, string>, extraArgs: readonly Arg[] = []) {
  const recipe = recipes.find((r) => r.id === id)
  expect(recipe, `missing recipe ${id}`).toBeDefined()
  const plan = toPlan(recipe!, values, 'posix')
  const outputIndex = plan.args.findIndex((arg) => arg.kind === 'value' && arg.name === 'output')
  const args: Arg[] = [{ kind: 'flag', name: 'y' }, ...plan.args]
  args.splice(outputIndex === -1 ? args.length : outputIndex, 0, ...extraArgs)
  return render({ tool: ffmpegPath, args }, 'posix')
}

describeRuntime('high-value recipe runtime', () => {
  let dir = ''
  let clip = ''

  beforeAll(async () => {
    dir = mkdtempSync(join(tmpdir(), 'ffmpeg-high-runtime-'))
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
      '-c:v',
      'libx264',
      '-c:a',
      'aac',
      clip,
    ])
  }, 60_000)

  afterAll(() => {
    if (dir) rmSync(dir, { recursive: true, force: true })
  })

  it('faststart produces an mp4', async () => {
    const outputBase = join(dir, 'faststart')
    const command = renderRecipe('faststart', { input: clip, output: outputBase })
    await runShell(command)
    const output = `${outputBase}.mp4`
    const probe = await ffprobeJson(output)
    expect((probe.streams ?? []).length).toBeGreaterThan(0)
    expect(Number(probe.format?.duration ?? '0')).toBeGreaterThan(0.5)
  }, 60_000)

  it('strip-metadata removes metadata', async () => {
    const withMeta = join(dir, 'with-meta.mkv')
    await run(ffmpegPath, ['-y', '-i', clip, '-metadata', 'title=hello', '-c', 'copy', withMeta])
    const output = join(dir, 'stripped.mkv')
    const command = renderRecipe('strip-metadata', { input: withMeta, output })
    await runShell(command)
    const probe = await ffprobeJson(output)
    expect(probe.format?.tags?.title).toBeUndefined()
    expect((probe.streams ?? []).length).toBeGreaterThan(0)
  }, 60_000)

  it('set-metadata writes metadata', async () => {
    const output = join(dir, 'meta.mkv')
    const command = renderRecipe('set-metadata', {
      input: clip,
      output,
      title: 'Title',
      language: 'eng',
    })
    await runShell(command)
    const probe = await ffprobeJson(output)
    expect(probe.format?.tags?.title).toBe('Title')
    const audio = (probe.streams ?? []).find((s) => s.codec_type === 'audio')
    expect(audio?.tags?.language).toBe('eng')
  }, 60_000)

  it('force-keyframes produces output', async () => {
    const output = join(dir, 'keyframes.mkv')
    const command = renderRecipe('force-keyframes', { input: clip, output }, [
      { kind: 'option', name: 'c:v', value: 'libx264' },
      { kind: 'option', name: 'c:a', value: 'copy' },
    ])
    await runShell(command)
    const probe = await ffprobeJson(output)
    expect((probe.streams ?? []).some((s) => s.codec_type === 'video')).toBe(true)
  }, 60_000)

  it('explicit-map copies mapped streams', async () => {
    const output = join(dir, 'mapped.mkv')
    const command = renderRecipe('explicit-map', { input: clip, output })
    await runShell(command)
    const probe = await ffprobeJson(output)
    const types = (probe.streams ?? []).map((s) => s.codec_type)
    expect(types).toContain('video')
    expect(types).toContain('audio')
  }, 60_000)

  it('scale changes dimensions through recipe', async () => {
    const output = join(dir, 'scaled.mkv')
    const command = renderRecipe('scale', { input: clip, output }, [
      { kind: 'option', name: 'c:v', value: 'libx264' },
      { kind: 'option', name: 'c:a', value: 'copy' },
    ])
    await runShell(command)
    const { stdout } = await run(ffprobePath, [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=width,height',
      '-of',
      'json',
      output,
    ])
    const probe = JSON.parse(stdout) as { streams?: Array<{ width?: number; height?: number }> }
    expect(probe.streams?.[0]?.width).toBe(32)
    expect(probe.streams?.[0]?.height).toBe(32)
  }, 60_000)

  it('loudnorm produces audio output', async () => {
    const output = join(dir, 'loudnorm.mkv')
    const command = renderRecipe('loudnorm', { input: clip, output }, [
      { kind: 'option', name: 'c:v', value: 'copy' },
      { kind: 'option', name: 'c:a', value: 'aac' },
    ])
    await runShell(command)
    const probe = await ffprobeJson(output)
    expect((probe.streams ?? []).some((s) => s.codec_type === 'audio')).toBe(true)
  }, 60_000)
})
