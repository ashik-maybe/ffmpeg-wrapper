import { describe, expect, it } from 'vitest'
import { render } from 'ink-testing-library'
import { App } from '../../src/tui/app.tsx'
import { OutcomeScreen, ResultScreen } from '../../src/tui/screens/index.ts'
import type { Recipe } from '../../src/core/types.ts'
import type { RuntimeSpec } from '../../src/tools/index.ts'

const spec: RuntimeSpec = {
  version: '7.0-test',
  options: ['i', 'c', 'c:v', 'c:a', 'ss', 't', 'vn'],
  filters: [],
  encoders: ['libx264', 'aac', 'copy'],
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
      { kind: 'value', name: 'input', value: '{{input}}' },
      { kind: 'option', name: 'c', value: 'copy' },
      { kind: 'value', name: 'output', value: '{{output}}' },
    ],
  },
]

function tick(ms = 40): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isAscii(text: string): boolean {
  for (let i = 0; i < text.length; i += 1) {
    if (text.charCodeAt(i) > 127) return false
  }
  return true
}

describe('tui ux', () => {
  it('help overlay opens with ?', async () => {
    const { lastFrame, stdin } = render(
      <App recipes={recipes} version="7.0-test" spec={spec} runEnabled={false} />,
    )
    await tick()
    stdin.write('?')
    await tick()
    const frame = lastFrame() ?? ''
    expect(frame).toMatch(/help/i)
    expect(frame).toContain('?')
    expect(frame).toContain('Esc')
  })

  it('step indicator shows step 1 of 3', () => {
    const { lastFrame } = render(
      <App recipes={recipes} version="7.0-test" spec={spec} runEnabled={false} />,
    )
    const frame = lastFrame() ?? ''
    expect(frame).toMatch(/1 of 3/i)
  })

  it('active outcome has a visible marker', () => {
    const { lastFrame } = render(
      <OutcomeScreen
        outcomes={[{ id: 'trim-copy', label: 'Trim copy' }]}
        selectedId="trim-copy"
        onSelect={() => {}}
      />,
    )
    const frame = lastFrame() ?? ''
    expect(frame).toContain('>')
    expect(frame).toContain('Trim copy')
  })

  it('progress bar shows time and speed', () => {
    const { lastFrame } = render(
      <ResultScreen
        command="ffmpeg -i in.mp4 out.mp4"
        findings={[]}
        version="7.0-test"
        running={true}
        progress={{ time: '00:00:05', speed: '1.5x' }}
      />,
    )
    const frame = lastFrame() ?? ''
    expect(frame).toContain('00:00:05')
    expect(frame).toContain('1.5x')
    expect(frame).toMatch(/[=[#]/)
  })

  it('narrow terminal hides the raw log', () => {
    const prev = process.stdout.columns
    Object.defineProperty(process.stdout, 'columns', { value: 50, configurable: true })
    try {
      const { lastFrame } = render(
        <App recipes={recipes} version="7.0-test" spec={spec} runEnabled={false} columns={50} />,
      )
      const frame = lastFrame() ?? ''
      expect(frame).not.toMatch(/Raw log/i)
    } finally {
      Object.defineProperty(process.stdout, 'columns', { value: prev, configurable: true })
    }
  })

  it('all key hints stay ASCII', async () => {
    const { lastFrame, stdin } = render(
      <App recipes={recipes} version="7.0-test" spec={spec} runEnabled={false} />,
    )
    await tick()
    const frames: string[] = []
    frames.push(lastFrame() ?? '')
    stdin.write('\r')
    await tick()
    frames.push(lastFrame() ?? '')
    stdin.write('\r')
    await tick()
    frames.push(lastFrame() ?? '')
    for (const frame of frames) {
      const hintLines = frame
        .split('\n')
        .filter(
          (l) => l.includes('[') || /\bEsc\b|\bEnter\b|move|select|edit|run|quit|help/i.test(l),
        )
      for (const line of hintLines) {
        expect(isAscii(line)).toBe(true)
      }
    }
  })
})
