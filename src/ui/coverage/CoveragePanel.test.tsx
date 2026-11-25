// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { spec, filterDetails, encoderDetails } from '../../spec/index'
import muxers from '../../spec/muxers.json'
import { CoveragePanel } from './CoveragePanel'

const expected: ReadonlyArray<readonly [string, number]> = [
  ['Options', spec.options.length],
  ['Filters', filterDetails.length],
  ['Encoders', encoderDetails.length],
  ['Muxers', muxers.length],
]

afterEach(cleanup)

describe('CoveragePanel', () => {
  it('shows the spec counts in a table', () => {
    render(<CoveragePanel />)
    expect(screen.getByRole('table')).toBeTruthy()
    for (const [label, count] of expected) {
      expect(screen.getByText(label)).toBeTruthy()
      expect(screen.getByText(String(count))).toBeTruthy()
    }
  })

  it('states that raw arguments are unverified', () => {
    render(<CoveragePanel />)
    expect(
      screen.getByText(/Raw arguments are unverified and combinations are not executed/),
    ).toBeTruthy()
  })
})
