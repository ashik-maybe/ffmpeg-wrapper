import { describe, expect, it } from 'vitest'
import { parseGraph, renderGraph, validateGraph } from './index'

const FILTER_NAMES = ['null', 'scale', 'crop', 'drawtext', 'overlay']

describe('parseGraph', () => {
  it('parses a simple chain', () => {
    const graph = parseGraph('null,scale=w=100')
    expect(graph.nodes.map((node) => node.name)).toEqual(['null', 'scale'])
    expect(graph.nodes[1]?.options).toBe('w=100')
  })

  it('reads two input labels on an overlay', () => {
    const graph = parseGraph('[a][b]overlay')
    expect(graph.nodes).toHaveLength(1)
    expect(graph.nodes[0]?.labelIns).toEqual(['a', 'b'])
    expect(graph.nodes[0]?.name).toBe('overlay')
  })

  it('records an output label after the filter name', () => {
    expect(parseGraph('null[out]').nodes[0]?.labelOut).toBe('out')
  })

  it('records an escaped colon in option values', () => {
    expect(parseGraph('scale=w=100\\:h=50').nodes[0]?.options).toBe('w=100\\:h=50')
  })

  it('records an escaped comma in option values', () => {
    expect(parseGraph('drawtext=text=a\\,b').nodes[0]?.options).toBe('text=a\\,b')
  })
})

describe('validateGraph', () => {
  it('reports missing labels as absent, not findings', () => {
    const graph = parseGraph('null,scale')
    expect(graph.nodes[1]?.labelOut).toBeUndefined()
    expect(validateGraph(graph, FILTER_NAMES)).toEqual([])
  })

  it('reports unknown filter names', () => {
    const findings = validateGraph(parseGraph('null,bogus'), FILTER_NAMES)
    expect(findings.map((finding) => finding.code)).toContain('G_UNKNOWN_FILTER')
  })

  it('reports duplicate output labels', () => {
    const findings = validateGraph(parseGraph('null[a],scale[a]'), FILTER_NAMES)
    expect(findings.map((finding) => finding.code)).toContain('G_DUPLICATE_OUTPUT_LABEL')
  })

  it('reports input labels without a matching output', () => {
    const findings = validateGraph(parseGraph('[a]null'), FILTER_NAMES)
    expect(findings.map((finding) => finding.code)).toContain('G_UNMATCHED_INPUT')
  })

  it('accepts input labels matched by an output label', () => {
    expect(validateGraph(parseGraph('null[a],[a]crop'), FILTER_NAMES)).toEqual([])
  })

  it('reports unterminated labels as unbalanced', () => {
    const graph = parseGraph('null[abc')
    expect(graph.unbalanced).toContain(0)
    expect(validateGraph(graph, FILTER_NAMES).map((finding) => finding.code)).toContain(
      'G_UNBALANCED_LABEL',
    )
  })
})

describe('renderGraph', () => {
  it('round-trips a chain with escaped options', () => {
    const text = 'null,drawtext=text=a\\,b,scale=w=100\\:h=50'
    expect(renderGraph(parseGraph(text))).toBe(text)
  })

  it('renders labels in order', () => {
    const graph = {
      nodes: [{ labelIns: ['a'], name: 'overlay', options: '' }],
      unbalanced: [],
    }
    expect(renderGraph(graph)).toBe('[a]overlay')
  })
})
