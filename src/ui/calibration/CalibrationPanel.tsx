import { useState } from 'react'
import { Callout } from '../primitives/Callout'
import { cn } from '../primitives/cn'
import { Field } from '../primitives/Field'
import { parseToolOutput, type CalibrationValues } from './parse'

export interface CalibrationPanelProps {
  readonly onParsed?: (values: CalibrationValues) => void
  readonly className?: string
}

function hasValues(values: CalibrationValues): boolean {
  return (
    values.duration !== undefined ||
    values.width !== undefined ||
    values.height !== undefined ||
    (values.codecs?.length ?? 0) > 0 ||
    values.version !== undefined
  )
}

function summarize(values: CalibrationValues): string {
  const parts: string[] = []
  if (values.version !== undefined) parts.push(`version ${values.version}`)
  if (values.width !== undefined && values.height !== undefined)
    parts.push(`${values.width}x${values.height}`)
  if (values.duration !== undefined) parts.push(`${values.duration.toFixed(1)}s`)
  if (values.codecs !== undefined && values.codecs.length > 0) {
    parts.push(`codecs ${values.codecs.join(', ')}`)
  }
  return parts.join(' | ')
}

export function CalibrationPanel({ onParsed, className }: CalibrationPanelProps) {
  const [text, setText] = useState('')
  const [message, setMessage] = useState<{ severity: 'error' | 'info'; text: string } | null>(null)

  const onChange = (next: string): void => {
    setText(next)
    if (next.trim() === '') {
      setMessage(null)
      return
    }
    const values = parseToolOutput(next)
    if (!hasValues(values)) {
      setMessage({
        severity: 'error',
        text: 'No ffprobe or ffmpeg values found in the pasted text.',
      })
      return
    }
    setMessage({ severity: 'info', text: `Read: ${summarize(values)}.` })
    onParsed?.(values)
  }

  return (
    <div className={cn('ui-calibration', className)}>
      <Field
        label="Paste tool output"
        htmlFor="calibration-paste"
        hint="ffprobe text or JSON, or ffmpeg -version output."
      >
        <textarea
          id="calibration-paste"
          className="ui-calibration__input"
          value={text}
          onChange={(event) => onChange(event.target.value)}
          rows={8}
          spellCheck={false}
        />
      </Field>
      {message === null ? null : <Callout severity={message.severity}>{message.text}</Callout>}
    </div>
  )
}
