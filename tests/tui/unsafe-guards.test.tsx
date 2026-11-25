import { describe, expect, it } from 'vitest'
import { parseArgs } from '../../src/tui/run.ts'

describe('unsafe and force flag parsing', () => {
  it('parses --force from argv', () => {
    expect(parseArgs(['--force']).force).toBe(true)
  })

  it('parses --unsafe from argv', () => {
    expect(parseArgs(['--unsafe']).unsafe).toBe(true)
  })
})
