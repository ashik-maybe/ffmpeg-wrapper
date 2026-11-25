// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import counts from './counts.json'
import { CoveragePanel } from './CoveragePanel'

const expected: ReadonlyArray<readonly [string, number]> = [
  ['Options', counts.options],
  ['Filters', counts.filters],
  ['Encoders', counts.encoders],
  ['Muxers', counts.muxers],
  ['Hwaccels', counts.hwaccels],
  ['Filter details', counts.filterDetails],
  ['Encoder details', counts.encoderDetails],
  ['Decoders', counts.decoders],
  ['Demuxers', counts.demuxers],
  ['Protocols', counts.protocols],
  ['Pixel formats', counts.pixelFormats],
  ['Sample formats', counts.sampleFormats],
  ['Option details', counts.optionDetails],
]

afterEach(cleanup)

describe('CoveragePanel', () => {
  it('shows the spec counts in a table', () => {
    render(<CoveragePanel />)
    expect(screen.getByRole('table')).toBeTruthy()
    for (const [label, count] of expected) {
      const row = screen.getByText(label).closest('tr')
      expect(row?.textContent).toContain(label)
      expect(row?.textContent).toContain(String(count))
    }
  })

  it('states browser limits and TUI execution', () => {
    render(<CoveragePanel />)
    expect(screen.getByText(/Raw arguments are unverified/)).toBeTruthy()
    expect(screen.getByText(/browser does not run FFmpeg/)).toBeTruthy()
    expect(screen.getByText(/TUI does the execution/)).toBeTruthy()
    expect(screen.getByText(/Linux only/)).toBeTruthy()
    expect(screen.getByText(/--run/)).toBeTruthy()
    expect(screen.getByText(/--yes/)).toBeTruthy()
    expect(screen.getByText(/--force/)).toBeTruthy()
    expect(screen.getByText(/--unsafe/)).toBeTruthy()
    expect(screen.getByText(/Ctrl\+C/)).toBeTruthy()
  })
})
