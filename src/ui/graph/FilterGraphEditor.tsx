import { useMemo } from 'react'
import { parseGraph, renderGraph, validateGraph } from '../../core/graph'
import { Callout } from '../primitives/Callout'
import { Field } from '../primitives/Field'

export interface FilterGraphEditorProps {
  readonly value: string
  readonly onChange: (text: string) => void
  readonly filterNames: readonly string[]
}

export function FilterGraphEditor({ value, onChange, filterNames }: FilterGraphEditorProps) {
  const graph = useMemo(() => parseGraph(value), [value])
  const findings = useMemo(() => validateGraph(graph, filterNames), [graph, filterNames])
  const rendered = useMemo(() => renderGraph(graph), [graph])

  return (
    <div className="ui-graph">
      <Field
        label="Filter graph"
        hint="Nodes separated by commas or semicolons, for example scale=w=1280,scale=h=720[out]."
      >
        <textarea
          className="ui-graph__input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={6}
          spellCheck={false}
        />
      </Field>
      {findings.map((finding) => (
        <Callout
          key={`${finding.code}-${finding.index}`}
          severity={finding.severity === 'error' ? 'error' : 'warning'}
        >
          {finding.message}
        </Callout>
      ))}
      <div className="ui-graph__output">
        <span className="ui-graph__output-label">Rendered command</span>
        <code className="ui-graph__command">{rendered}</code>
      </div>
    </div>
  )
}
