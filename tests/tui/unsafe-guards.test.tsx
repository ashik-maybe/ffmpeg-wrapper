import { describe, expect, it, vi } from 'vitest'
import { render } from 'ink-testing-library'
import { App } from '../../src/tui/app.tsx'
import { parseArgs } from '../../src/tui/run.ts'
import type { Recipe } from '../../src/core/types.ts'
import type { RuntimeSpec } from '../../src/tools/index.ts'

const spec: RuntimeSpec = {
  version: '9.1-test',
  options: ['i', 'c', 'copy'],
  filters: [],
  encoders: ['libx264', 'aac', 'copy'],
  muxers: ['mp4'],
  demuxers: ['mov,mp4,m4a,3gp,3g2,mj2'],
  protocols: ['file'],
  hwaccels: [],
  pixFmts: ['yuv420p'],
  sampleFmts: ['fltp'],
}

const networkRecipe: Recipe[] = [
  {
    id: 'hls',
    tool: 'ffmpeg',
    args: [
      { kind: 'value', name: 'input', value: '{{input}}' },
      { kind: 'value', name: 'output', value: '{{output}}' },
    ],
  },
]

const hardwareRecipe: Recipe[] = [
  {
    id: 'nvenc',
    tool: 'ffmpeg',
    args: [
      { kind: 'value', name: 'input', value: '{{input}}' },
      { kind: 'option', name: 'c:v', value: 'h264_nvenc' },
      { kind: 'value', name: 'output', value: '{{output}}' },
    ],
  },
]

function tick(ms = 40): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function toResult(stdin: { write: (s: string) => void }) {
  stdin.write('\r')
  await tick()
  stdin.write('in.mp4')
  await tick()
  stdin.write('\t')
  await tick()
  stdin.write('out.mp4')
  await tick()
  stdin.write('\r')
  await tick()
}

describe('unsafe and force flag parsing', () => {
  it('parses --force from argv', () => {
    expect(parseArgs(['--force']).force).toBe(true)
  })

  it('parses --unsafe from argv', () => {
    expect(parseArgs(['--unsafe']).unsafe).toBe(true)
  })
})

describe('App-level unsafe guards', () => {
  it('blocks a network recipe without --unsafe', async () => {
    const onRun = vi.fn(async () => ({ exitCode: 0, stdout: '', stderr: '', durationMs: 1 }))
    const { lastFrame, stdin } = render(
      <App
        recipes={networkRecipe}
        spec={spec}
        version="9.1-test"
        runEnabled
        yes
        outputExists={async () => false}
        onRun={onRun}
      />,
    )
    await toResult(stdin)
    await tick(80)
    expect(onRun).not.toHaveBeenCalled()
    expect(lastFrame() ?? '').toContain('Blocked')
  })

  it('runs a network recipe with --unsafe', async () => {
    const onRun = vi.fn(async () => ({ exitCode: 0, stdout: '', stderr: '', durationMs: 1 }))
    const { stdin } = render(
      <App
        recipes={networkRecipe}
        spec={spec}
        version="9.1-test"
        runEnabled
        yes
        unsafe
        outputExists={async () => false}
        onRun={onRun}
      />,
    )
    await toResult(stdin)
    await tick(80)
    expect(onRun).toHaveBeenCalledTimes(1)
  })

  it('requires confirmation for hardware recipes with --yes', async () => {
    const onRun = vi.fn(async () => ({ exitCode: 0, stdout: '', stderr: '', durationMs: 1 }))
    const { lastFrame, stdin } = render(
      <App
        recipes={hardwareRecipe}
        spec={spec}
        version="9.1-test"
        runEnabled
        yes
        outputExists={async () => false}
        onProbe={async () => ({ exitCode: 0, stdout: '', stderr: '', durationMs: 1 })}
        outputNonEmpty={async () => true}
        onRun={onRun}
      />,
    )
    await toResult(stdin)
    await tick(80)
    expect(onRun).not.toHaveBeenCalled()
    expect(lastFrame() ?? '').toContain('unverified')
  })
})
