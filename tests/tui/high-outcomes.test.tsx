import { describe, expect, it, vi } from 'vitest'
import { render } from 'ink-testing-library'
import { App } from '../../src/tui/app.tsx'
import { OutcomeScreen } from '../../src/tui/screens/index.ts'

function tick(ms = 30): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const outcomes = [
  { id: 'faststart', label: 'Prepare for web playback', group: 'Delivery' },
  { id: 'strip-metadata', label: 'Strip metadata', group: 'Metadata' },
  { id: 'force-keyframes', label: 'Force keyframes', group: 'Timing' },
  { id: 'side-by-side', label: 'Stack side by side', group: 'Graphs' },
]

describe('high-value outcomes', () => {
  it('renders grouped headings', () => {
    const { lastFrame } = render(
      <OutcomeScreen outcomes={outcomes} selectedId="faststart" onSelect={() => {}} />,
    )

    const frame = lastFrame() ?? ''
    expect(frame).toContain('Delivery')
    expect(frame).toContain('Metadata')
    expect(frame).toContain('Timing')
    expect(frame).toContain('Graphs')
    expect(frame).toContain('Prepare for web playback')
    expect(frame).toContain('Strip metadata')
  })

  it('moves selection with arrow navigation across groups', () => {
    const onSelect = vi.fn()
    const { stdin, rerender, lastFrame } = render(
      <OutcomeScreen outcomes={outcomes} selectedId="faststart" onSelect={onSelect} />,
    )

    stdin.write('\u001B[B')
    expect(onSelect).toHaveBeenCalledWith('strip-metadata')
    rerender(<OutcomeScreen outcomes={outcomes} selectedId="strip-metadata" onSelect={onSelect} />)
    expect(lastFrame() ?? '').toContain('> 2. Strip metadata')

    stdin.write('\u001B[A')
    expect(onSelect).toHaveBeenCalledWith('faststart')
  })

  it('selects a high-value recipe in the app', async () => {
    const { lastFrame, stdin } = render(<App runEnabled={false} version="test" />)
    await tick()

    let frame = lastFrame() ?? ''
    expect(frame).toContain('Delivery')
    expect(frame).toContain('Metadata')
    expect(frame).toContain('Timing')
    expect(frame).toContain('Graphs')

    stdin.write('\u001B[B')
    await tick()
    stdin.write('\u001B[B')
    await tick()
    stdin.write('\u001B[B')
    await tick()
    stdin.write('\u001B[B')
    await tick()

    frame = lastFrame() ?? ''
    expect(frame).toContain('> 5. Strip metadata')

    stdin.write('\r')
    await tick()
    stdin.write('\r')
    await tick()

    frame = lastFrame() ?? ''
    expect(frame).toContain('ffmpeg')
    expect(frame).toContain('metadata')
  })
})
