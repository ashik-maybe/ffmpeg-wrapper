import { describe, expect, it, vi } from 'vitest'
import { render } from 'ink-testing-library'
import { App } from '../../src/tui/app.tsx'
import type { Recipe } from '../../src/core/types.ts'
import type { RuntimeSpec } from '../../src/tools/index.ts'

const baseSpec: RuntimeSpec = {
  version: '7.0-test',
  options: ['i', 'c', 'c:v', 'c:a', 'ss', 't', 'vn', 'preset', 'crf'],
  filters: [],
  encoders: ['libx264', 'aac', 'copy'],
  muxers: ['mp4'],
  demuxers: ['mov,mp4,m4a,3gp,3g2,mj2'],
  protocols: ['file'],
  hwaccels: [],
  pixFmts: ['yuv420p'],
  sampleFmts: ['fltp'],
}

const unboundRecipe: Recipe[] = [
  {
    id: 'unbound',
    tool: 'ffmpeg',
    args: [
      { kind: 'value', name: 'input', value: '{{input}}' },
      { kind: 'option', name: 'crf', value: '{{crf}}' },
      { kind: 'value', name: 'output', value: '{{output}}' },
    ],
  },
]

const basicRecipe: Recipe[] = [
  {
    id: 'basic',
    tool: 'ffmpeg',
    args: [
      { kind: 'value', name: 'input', value: '{{input}}' },
      { kind: 'option', name: 'c', value: 'copy' },
      { kind: 'value', name: 'output', value: '{{output}}' },
    ],
  },
]

function tick(ms = 30): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function toResult(stdin: { write: (s: string) => void }) {
  stdin.write('\r')
  await tick()
  stdin.write('\r')
  await tick()
}

describe('execution hardening', () => {
  it('blocks execution when a placeholder is unbound', async () => {
    const onRun = vi.fn(async () => ({ exitCode: 0, stdout: '', stderr: '', durationMs: 1 }))
    const { lastFrame, stdin, unmount } = render(
      <App
        recipes={unboundRecipe}
        version="7.0-test"
        spec={baseSpec}
        runEnabled={true}
        yes={true}
        onRun={onRun}
      />,
    )

    await toResult(stdin)
    await tick(60)

    expect(onRun).not.toHaveBeenCalled()
    const frame = lastFrame() ?? ''
    expect(frame).toMatch(/UNBOUND_PLACEHOLDER|Unbound placeholder/i)
    unmount()
  })

  it('blocks execution when output file exists', async () => {
    const onRun = vi.fn(async () => ({ exitCode: 0, stdout: '', stderr: '', durationMs: 1 }))
    const outputExists = vi.fn(async () => true)
    const { lastFrame, stdin, unmount } = render(
      <App
        recipes={basicRecipe}
        version="7.0-test"
        spec={baseSpec}
        runEnabled={true}
        yes={true}
        onRun={onRun}
        outputExists={outputExists}
      />,
    )

    await toResult(stdin)
    await tick(60)

    expect(onRun).not.toHaveBeenCalled()
    expect(lastFrame() ?? '').toMatch(/exists|overwrite/i)
    unmount()
  })

  it('verifies output with ffprobe after successful run', async () => {
    const onRun = vi.fn(async () => ({ exitCode: 0, stdout: '', stderr: '', durationMs: 5 }))
    const onProbe = vi.fn(async () => ({ exitCode: 0, stdout: '{}', stderr: '', durationMs: 2 }))
    const outputExists = vi.fn(async (_path: string) => false)
    const outputNonEmpty = vi.fn(async (_path: string) => true)
    const { lastFrame, stdin, unmount } = render(
      <App
        recipes={basicRecipe}
        version="7.0-test"
        spec={baseSpec}
        runEnabled={true}
        yes={true}
        onRun={onRun}
        onProbe={onProbe}
        outputExists={outputExists}
        outputNonEmpty={outputNonEmpty}
      />,
    )

    await toResult(stdin)
    await tick(80)

    expect(onRun).toHaveBeenCalledTimes(1)
    expect(onProbe).toHaveBeenCalledTimes(1)
    const probeArgv = onProbe.mock.calls[0]?.[0] as string[]
    expect(probeArgv.some((a) => a.includes('ffprobe'))).toBe(true)
    expect(lastFrame() ?? '').toMatch(/verified/i)
    unmount()
  })

  it('allows overwrite when --force is set', async () => {
    const onRun = vi.fn(async () => ({ exitCode: 0, stdout: '', stderr: '', durationMs: 5 }))
    const onProbe = vi.fn(async () => ({ exitCode: 0, stdout: '{}', stderr: '', durationMs: 2 }))
    const outputExists = vi.fn(async () => true)
    const outputNonEmpty = vi.fn(async () => true)
    const { stdin, unmount } = render(
      <App
        recipes={basicRecipe}
        version="7.0-test"
        spec={baseSpec}
        runEnabled={true}
        yes={true}
        force={true}
        onRun={onRun}
        onProbe={onProbe}
        outputExists={outputExists}
        outputNonEmpty={outputNonEmpty}
      />,
    )

    await toResult(stdin)
    await tick(80)

    expect(onRun).toHaveBeenCalledTimes(1)
    unmount()
  })
})
