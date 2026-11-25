import { describe, expect, it, vi } from 'vitest'
import { render } from 'ink-testing-library'
import { OutcomeScreen, OptionsScreen, ResultScreen } from '../../src/tui/screens/index.ts'

const outcomes = [
  { id: 'trim', label: 'Trim clip' },
  { id: 'crop', label: 'Crop frame' },
  { id: 'scale', label: 'Scale video' },
]

describe('OutcomeScreen', () => {
  it('renders first screen with numbered list', () => {
    const { lastFrame } = render(
      <OutcomeScreen outcomes={outcomes} selectedId="trim" onSelect={() => {}} />,
    )

    const frame = lastFrame() ?? ''
    expect(frame).toContain('FFmpeg TUI')
    expect(frame).toContain('1. Trim clip')
    expect(frame).toContain('2. Crop frame')
    expect(frame).toContain('3. Scale video')
    expect(frame).toContain('> 1. Trim clip')
  })

  it('moves selection with arrow navigation', () => {
    const onSelect = vi.fn()
    const { lastFrame, stdin, rerender } = render(
      <OutcomeScreen outcomes={outcomes} selectedId="trim" onSelect={onSelect} />,
    )

    stdin.write('\u001B[B')
    expect(onSelect).toHaveBeenCalledWith('crop')
    rerender(<OutcomeScreen outcomes={outcomes} selectedId="crop" onSelect={onSelect} />)
    expect(lastFrame() ?? '').toContain('> 2. Crop frame')

    stdin.write('\u001B[A')
    expect(onSelect).toHaveBeenCalledWith('trim')
  })

  it('selects current item on Enter', () => {
    const onSelect = vi.fn()
    const { stdin } = render(
      <OutcomeScreen outcomes={outcomes} selectedId="crop" onSelect={onSelect} />,
    )

    stdin.write('\r')
    expect(onSelect).toHaveBeenCalledWith('crop')
  })
})

describe('OptionsScreen', () => {
  it('renders option fields', () => {
    const { lastFrame } = render(
      <OptionsScreen
        filePath="input.mp4"
        inPoint="00:00:01"
        outPoint="00:00:05"
        mode="copy"
        rawArgs="-vn"
        onChange={() => {}}
      />,
    )

    const frame = lastFrame() ?? ''
    expect(frame).toContain('Options (POSIX)')
    expect(frame).toContain('input.mp4')
    expect(frame).toContain('00:00:01')
    expect(frame).toContain('00:00:05')
    expect(frame).toContain('copy')
    expect(frame).toContain('-vn')
  })
})

describe('ResultScreen', () => {
  it('renders command and quiet validation findings', () => {
    const { lastFrame } = render(
      <ResultScreen
        command="ffmpeg -i input.mp4 -c copy out.mp4"
        findings={[{ severity: 'warning', code: 'E_UNVERIFIED', message: 'Check codec support' }]}
        version="ffmpeg 7.0"
        running={false}
      />,
    )

    const frame = lastFrame() ?? ''
    expect(frame).toContain('ffmpeg 7.0')
    expect(frame).toContain('ffmpeg -i input.mp4 -c copy out.mp4')
    expect(frame).toContain('[warning] Check codec support')
  })
})
