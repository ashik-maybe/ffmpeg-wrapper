import { useState } from 'react'
import { Callout } from '../primitives/Callout'
import { cn } from '../primitives/cn'
import { Field } from '../primitives/Field'
import { parseBuildOutput, summarize, type BuildCheckSummary } from './parse'

export interface UserBuildCheckProps {
  readonly className?: string
  readonly onSummary?: (summary: BuildCheckSummary | null) => void
}

function formatSummary(summary: BuildCheckSummary): string {
  if (!summary.found) return 'No ffmpeg output found in the pasted text.'
  const parts: string[] = [
    summary.version === undefined
      ? 'Version: not found'
      : `Version: ${summary.version} ${summary.versionMatch ? 'matches' : 'mismatch'}`,
    summary.missingEncoders.length === 0
      ? 'Encoders: all present'
      : `Encoders: missing ${summary.missingEncoders.join(', ')}`,
    summary.missingFilters.length === 0
      ? 'Filters: all present'
      : `Filters: missing ${summary.missingFilters.join(', ')}`,
  ]
  return parts.join(' · ')
}

export function UserBuildCheck({ className, onSummary }: UserBuildCheckProps) {
  const [text, setText] = useState('')
  const [summary, setSummary] = useState<BuildCheckSummary | null>(null)

  const onChange = (next: string): void => {
    setText(next)
    const nextSummary = next.trim() === '' ? null : summarize(parseBuildOutput(next))
    setSummary(nextSummary)
    onSummary?.(nextSummary)
  }

  const summaryText = summary === null ? null : formatSummary(summary)
  const summaryOk =
    summary !== null &&
    summary.found &&
    summary.versionMatch &&
    summary.missingEncoders.length === 0 &&
    summary.missingFilters.length === 0

  return (
    <div className={cn('ui-buildcheck', className)}>
      <Field
        label="Pasted ffmpeg output"
        htmlFor="buildcheck-paste"
        hint="Paste ffmpeg -version, -encoders, and -filters output."
      >
        <textarea
          id="buildcheck-paste"
          className="ui-buildcheck__input"
          value={text}
          onChange={(event) => onChange(event.target.value)}
          rows={8}
          spellCheck={false}
        />
      </Field>
      {summaryText === null ? null : (
        <Callout severity={summaryOk ? 'info' : 'warning'}>{summaryText}</Callout>
      )}
    </div>
  )
}
