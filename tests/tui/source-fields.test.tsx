import { describe, expect, it, vi } from 'vitest'
import { render } from 'ink-testing-library'
import { App } from '../../src/tui/app.tsx'
import { OptionsScreen } from '../../src/tui/screens/index.ts'
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

describe('source fields', () => {
  it('options screen shows Input path and Output path fields', () => {
    const { lastFrame } = render(
      <OptionsScreen
        inputPath="in.mp4"
        outputPath="out.mp4"
        inPoint=""
        outPoint=""
        mode="copy"
        rawArgs=""
        onChange={() => {}}
        onInputPathChange={() => {}}
        onOutputPathChange={() => {}}
      />,
    )
    const frame = lastFrame() ?? ''
    expect(frame).toContain('Input path')
    expect(frame).toContain('Output path')
    expect(frame).toContain('in.mp4')
    expect(frame).toContain('out.mp4')
  })

  it('values can be typed', async () => {
    const { lastFrame, stdin } = render(
      <App recipes={recipes} version="7.0-test" spec={baseSpec} runEnabled={false} />,
    )
    // outcome -> options
    stdin.write('\r')
    await tick()
    // type into input path (first field)
    stdin.write('in.mp4')
    await tick()
    // move to output path
    stdin.write('\t')
    await tick()
    stdin.write('out.mp4')
    await tick()
    const frame = lastFrame() ?? ''
    expect(frame).toContain('in.mp4')
    expect(frame).toContain('out.mp4')
  })

  it('app passes input/output into binding and emits -i input and final output', async () => {
    const onRun = vi.fn(async () => ({ exitCode: 0, stdout: '', stderr: '', durationMs: 1 }))
    const { lastFrame, stdin } = render(
      <App
        recipes={recipes}
        version="7.0-test"
        spec={baseSpec}
        runEnabled={true}
        yes={true}
        onRun={onRun}
      />,
    )
    // outcome -> options
    stdin.write('\r')
    await tick()
    // input path
    stdin.write('in.mp4')
    await tick()
    // output path
    stdin.write('\t')
    await tick()
    stdin.write('out.mp4')
    await tick()
    // options -> result (triggers run with yes)
    stdin.write('\r')
    await tick(80)
    const frame = lastFrame() ?? ''
    expect(frame).toContain('-i')
    expect(frame).toContain('in.mp4')
    expect(frame).toContain('out.mp4')
    expect(onRun).toHaveBeenCalled()
    const argv = onRun.mock.calls[0]?.[0] as string[]
    expect(argv).toContain('-i')
    expect(argv).toContain('in.mp4')
    expect(argv).toContain('out.mp4')
  })
})
