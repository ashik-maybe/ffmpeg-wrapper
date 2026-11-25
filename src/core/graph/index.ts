import type { FilterNode, Graph, Finding } from './types'

export type { FilterNode, Graph, Finding } from './types'

/**
 * Split text into node segments on unescaped `,` and `;`. Escapes stay in the
 * segments so parsing can keep them as written.
 */
function splitSegments(text: string): string[] {
  const segments: string[] = []
  let current = ''
  let pos = 0
  while (pos < text.length) {
    if (text[pos] === '\\') {
      current += text.slice(pos, pos + 2)
      pos += 2
      continue
    }
    if (text[pos] === ',' || text[pos] === ';') {
      segments.push(current)
      current = ''
      pos++
      continue
    }
    current += text[pos]
    pos++
  }
  segments.push(current)
  return segments
}

/**
 * Parse one node segment: leading input labels, the filter name, the option
 * string after `=`, and a trailing output label. Unterminated labels mark
 * the result as unbalanced.
 */
function parseNode(segment: string): { node?: FilterNode; unbalanced: boolean } {
  const text = segment.trim()
  if (text === '') return { unbalanced: false }

  let pos = 0
  let unbalanced = false
  const labelIns: string[] = []
  while (text[pos] === '[') {
    const close = text.indexOf(']', pos + 1)
    if (close === -1) {
      labelIns.push(text.slice(pos + 1))
      unbalanced = true
      pos = text.length
      break
    }
    labelIns.push(text.slice(pos + 1, close))
    pos = close + 1
  }

  let nameEnd = pos
  while (nameEnd < text.length && text[nameEnd] !== '=' && text[nameEnd] !== '[') nameEnd++
  const name = text.slice(pos, nameEnd).trim()
  pos = nameEnd

  let options = ''
  let labelOut: string | undefined
  while (pos < text.length) {
    if (text[pos] === '=') {
      pos++
      const start = pos
      while (pos < text.length) {
        if (text[pos] === '\\' && pos + 1 < text.length) {
          pos += 2
          continue
        }
        if (text[pos] === '[') break
        pos++
      }
      options = text.slice(start, pos)
    } else if (text[pos] === '[') {
      const close = text.indexOf(']', pos + 1)
      if (close === -1) {
        labelOut = text.slice(pos + 1)
        unbalanced = true
        pos = text.length
      } else {
        labelOut = text.slice(pos + 1, close)
        pos = close + 1
      }
    } else {
      pos++
    }
  }

  const node: FilterNode =
    labelOut === undefined ? { labelIns, name, options } : { labelIns, name, options, labelOut }
  return { node, unbalanced }
}

/**
 * Parse a filter graph from its textual form. Nodes keep source order; both
 * `,` and `;` split chains.
 */
export function parseGraph(text: string): Graph {
  const nodes: FilterNode[] = []
  const unbalanced: number[] = []
  for (const segment of splitSegments(text)) {
    const { node, unbalanced: flagged } = parseNode(segment)
    if (node !== undefined) {
      nodes.push(node)
      if (flagged) unbalanced.push(nodes.length - 1)
    }
  }
  return { nodes, unbalanced }
}

/**
 * Validate a graph against the set of filter names. Reports unbalanced
 * labels, unknown filter names, duplicate output labels, and input labels
 * that no output label produces.
 */
export function validateGraph(graph: Graph, filterNames: readonly string[]): Finding[] {
  const findings: Finding[] = []
  const outputs = new Set<string>()
  for (const [index, node] of graph.nodes.entries()) {
    if (!filterNames.includes(node.name)) {
      findings.push({
        severity: 'error',
        code: 'G_UNKNOWN_FILTER',
        message: `Unknown filter name '${node.name}' at node ${index}.`,
        index,
      })
    }
    if (node.labelOut !== undefined) {
      if (outputs.has(node.labelOut)) {
        findings.push({
          severity: 'error',
          code: 'G_DUPLICATE_OUTPUT_LABEL',
          message: `Duplicate output label '${node.labelOut}' at node ${index}.`,
          index,
        })
      } else {
        outputs.add(node.labelOut)
      }
    }
  }
  for (const index of graph.unbalanced) {
    findings.push({
      severity: 'error',
      code: 'G_UNBALANCED_LABEL',
      message: `Unterminated label at node ${index}.`,
      index,
    })
  }
  for (const [index, node] of graph.nodes.entries()) {
    for (const label of node.labelIns) {
      if (!outputs.has(label)) {
        findings.push({
          severity: 'error',
          code: 'G_UNMATCHED_INPUT',
          message: `Input label '${label}' at node ${index} is not produced by any output label.`,
          index,
        })
      }
    }
  }
  return findings
}

/**
 * Escape option text for ffmpeg syntax: escape `,` and `:` with a backslash
 * unless they are already escaped.
 */
function escapeOptions(options: string): string {
  return options.replace(/(?<!\\)([:,])/g, '\\$1')
}

function renderNode(node: FilterNode): string {
  const parts: string[] = []
  for (const label of node.labelIns) parts.push(`[${label}]`)
  parts.push(node.name)
  if (node.options !== '') parts.push(`=${escapeOptions(node.options)}`)
  if (node.labelOut !== undefined) parts.push(`[${node.labelOut}]`)
  return parts.join('')
}

/**
 * Render a graph back to text, preserving node order.
 */
export function renderGraph(graph: Graph): string {
  return graph.nodes.map(renderNode).join(',')
}
