// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AdvancedDrawer } from './AdvancedDrawer'
import { rawArgSnippets } from './snippets'

afterEach(cleanup)

describe('AdvancedDrawer snippets', () => {
  it('renders each raw argument snippet', () => {
    render(<AdvancedDrawer open={true} onOpenChange={() => {}} />)

    expect(screen.getByText('Snippets')).toBeTruthy()
    for (const snippet of rawArgSnippets) {
      expect(screen.getByText(snippet.label)).toBeTruthy()
      expect(screen.getByText(snippet.flag)).toBeTruthy()
    }
  })
})
