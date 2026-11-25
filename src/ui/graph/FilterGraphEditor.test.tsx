// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FilterGraphEditor } from './FilterGraphEditor'

const FILTERS = ['null', 'scale', 'crop']

afterEach(cleanup)

describe('FilterGraphEditor', () => {
  it('shows findings for unknown filters and renders the graph', () => {
    render(
      <FilterGraphEditor
        value="scale=w=100,frobnicate"
        onChange={() => {}}
        filterNames={FILTERS}
      />,
    )
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toBe('scale=w=100,frobnicate')
    expect(screen.getByText("Unknown filter name 'frobnicate' at node 1.")).toBeTruthy()
    expect(document.querySelector('.ui-graph__command')?.textContent).toBe('scale=w=100,frobnicate')
  })

  it('shows findings for unmatched input labels', () => {
    render(<FilterGraphEditor value="[unused]null" onChange={() => {}} filterNames={FILTERS} />)
    expect(screen.getByText(/is not produced by any output label/)).toBeTruthy()
  })

  it('shows nothing for a valid graph', () => {
    render(<FilterGraphEditor value="null,scale=w=100" onChange={() => {}} filterNames={FILTERS} />)
    expect(screen.queryByText(/Unknown filter name/)).toBeNull()
    expect(document.querySelector('.ui-graph__command')?.textContent).toBe('null,scale=w=100')
  })

  it('calls onChange with the edited text', () => {
    const onChange = vi.fn()
    render(<FilterGraphEditor value="" onChange={onChange} filterNames={FILTERS} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'null' } })
    expect(onChange).toHaveBeenCalledWith('null')
  })
})
