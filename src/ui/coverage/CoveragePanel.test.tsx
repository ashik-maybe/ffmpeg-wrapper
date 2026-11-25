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

  it('states that raw arguments are unverified', () => {
    render(<CoveragePanel />)
    expect(
      screen.getByText(/Raw arguments are unverified and combinations are not executed/),
    ).toBeTruthy()
  })
})
