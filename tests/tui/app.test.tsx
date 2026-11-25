import { describe, expect, it, vi } from 'vitest'
import { render } from 'ink-testing-library'
import { App } from '../../src/tui/app.tsx'
import { run } from '../../src/tui/run.ts'
import type { Recipe } from '../../src/core/types.ts'
import type { RuntimeSpec } from '../../src/tools/index.ts'

const baseSpec: RuntimeSpec = {
  version: '7.0-test',
  options: ['i', 'c', 'c:v', 'c:a', 'ss', 't', 'vn', 'preset', 'crf'],
  filters: [],
  encoders: ['libx264', 'aac'],
  muxers: ['mp4'],
  demuxers: ['mov,mp4,m4a,3gp,3g2,mj2'],
  protocols: ['file'],
  hwaccels: [],
  pixFmts: ['yuv420p'],
  sampleFmts: ['fltp'],
}

const recipes: Recipe[] = [
  {
    id: 'trim-copy',
    tool: 'ffmpeg',
    args: [
      { kind: 'option', name: 'ss', value: '{{start}}' },
      { kind: 'option', name: 't', value: '{{duration}}' },
      { kind: 'value', name: 'input', value: '{{input}}' },
      { kind: 'option', name: 'c', value: 'copy' },
      { kind: 'value', name: 'output', value: '{{output}}' },
    ],
  },
]

function tick(ms = 30): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('tui app', () => {
  it('default render', () => {
    const { lastFrame } = render(
      <App recipes={recipes} version="7.0-test" spec={baseSpec} runEnabled={false} />,
    )
    const frame = lastFrame() ?? ''
    expect(frame).toContain('FFmpeg TUI')
    expect(frame).toContain('trim-copy')
  })

  it('--version output', async () => {
    const log = vi.fn()
    await run(['--version'], {
      log,
      detectBinaries: async () => ({ errors: [] }),
      compileRuntimeSpec: async () => ({
        spec: baseSpec,
        provenance: { version: '7.0-test', generatedAt: '', cacheKey: 'k', outputs: {} },
      }),
    })
    expect(log).toHaveBeenCalledWith('ffmpeg-tui 0.0.0')
  })

  it('unknown flag in a command', async () => {
    const badRecipes: Recipe[] = [
      {
        id: 'bad',
        tool: 'ffmpeg',
        args: [
          { kind: 'value', name: 'input', value: '{{input}}' },
          { kind: 'option', name: 'bogus-flag', value: '1' },
          { kind: 'value', name: 'output', value: '{{output}}' },
        ],
      },
    ]
    const { lastFrame, stdin } = render(
      <App recipes={badRecipes} version="7.0-test" spec={baseSpec} runEnabled={false} />,
    )

    // outcome -> options
    stdin.write('\r')
    await tick()
    // options -> result
    stdin.write('\r')
    await tick()

    const frame = lastFrame() ?? ''
    expect(frame).toContain('Unknown option')
    expect(frame).toContain('bogus-flag')
  })

  it('--run gating', async () => {
    const onRun = vi.fn(async () => ({ exitCode: 0, stdout: '', stderr: '', durationMs: 1 }))

    const disabled = render(
      <App recipes={recipes} version="7.0-test" spec={baseSpec} runEnabled={false} onRun={onRun} />,
    )
    disabled.stdin.write('\r')
    await tick()
    disabled.stdin.write('\r')
    await tick()
    expect(disabled.lastFrame() ?? '').toContain('Run disabled')
    disabled.stdin.write('\r')
    await tick()
    expect(onRun).not.toHaveBeenCalled()
    disabled.unmount()

    const onRun2 = vi.fn(async () => ({ exitCode: 0, stdout: '', stderr: '', durationMs: 2 }))
    const enabled = render(
      <App
        recipes={recipes}
        version="7.0-test"
        spec={baseSpec}
        runEnabled={true}
        yes={true}
        onRun={onRun2}
      />,
    )
    enabled.stdin.write('\r')
    await tick()
    enabled.stdin.write('\r')
    await tick(60)
    expect(onRun2).toHaveBeenCalledTimes(1)
    const argv = onRun2.mock.calls[0]?.[0] as string[]
    expect(argv[0]).toBe('ffmpeg')
    enabled.unmount()
  })
})
