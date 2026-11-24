import * as Slider from '@radix-ui/react-slider'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { useCallback, useState } from 'react'
import { Callout } from '../primitives/Callout'
import { Segmented } from '../primitives/Segmented'
import { cn } from '../primitives/cn'
import './moment.css'

export type TrimPoints = {
  inPoint: number
  outPoint: number
}

export type TrimRulerMode = 'trim' | 'copy'

export type TrimRulerProps = {
  inPoint: number
  outPoint: number
  onChange: (points: TrimPoints) => void
  min?: number
  max?: number
  mode?: TrimRulerMode
  onModeChange?: (mode: TrimRulerMode) => void
  className?: string
}

const TIMECODE_PATTERN = /^(?:(\d+):)?(\d{1,2}):(\d{2})\.(\d{3})$/

function parseTimecode(text: string): number | null {
  const match = TIMECODE_PATTERN.exec(text.trim())
  if (!match) return null
  const hours = Number(match[1] ?? 0)
  const minutes = Number(match[2])
  const seconds = Number(match[3])
  const millis = Number(match[4])
  if (minutes > 59 || seconds > 59) return null
  return hours * 3600 + minutes * 60 + seconds + millis / 1000
}

function formatTimecode(value: number): string {
  const totalMilliseconds = Math.max(0, Math.round(value * 1000))
  const hours = Math.floor(totalMilliseconds / 3_600_000)
  const minutes = Math.floor((totalMilliseconds % 3_600_000) / 60_000)
  const seconds = Math.floor((totalMilliseconds % 60_000) / 1_000)
  const millis = totalMilliseconds % 1_000
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${String(millis).padStart(3, '0')}`
}

function formatSeconds(value: number): string {
  return value.toFixed(3)
}

type TimecodeFieldProps = {
  label: string
  value: string
  onChange: (text: string) => void
  onCommit: (text: string) => void
}

function TimecodeField({ label, value, onChange, onCommit }: TimecodeFieldProps) {
  return (
    <label className="trim-ruler__timecode">
      <span className="trim-ruler__timecode-label">{label}</span>
      <input
        aria-label={label}
        className="trim-ruler__timecode-input"
        onBlur={() => onCommit(value)}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            onCommit(value)
          }
        }}
        value={value}
      />
    </label>
  )
}

export function TrimRuler({
  inPoint,
  outPoint,
  onChange,
  min = 0,
  max = 60,
  mode = 'trim',
  onModeChange,
  className,
}: TrimRulerProps) {
  const [inDraft, setInDraft] = useState<string | null>(null)
  const [outDraft, setOutDraft] = useState<string | null>(null)
  const inText = inDraft ?? formatTimecode(inPoint)
  const outText = outDraft ?? formatTimecode(outPoint)

  const toPoint = useCallback(
    (text: string): number | null => {
      const seconds = parseTimecode(text)
      if (seconds === null) return null
      return Math.min(Math.max(seconds, min), max)
    },
    [min, max],
  )

  const commitIn = useCallback(
    (text: string) => {
      const value = toPoint(text)
      if (value !== null) {
        onChange({ inPoint: value, outPoint })
        setInDraft(null)
      }
    },
    [outPoint, onChange, toPoint],
  )

  const commitOut = useCallback(
    (text: string) => {
      const value = toPoint(text)
      if (value !== null) {
        onChange({ inPoint, outPoint: value })
        setOutDraft(null)
      }
    },
    [inPoint, onChange, toPoint],
  )

  const handleSliderChange = useCallback(
    ([a, b]: number[]) => onChange({ inPoint: a, outPoint: b }),
    [onChange],
  )

  const duration = Math.max(0, outPoint - inPoint)

  return (
    <div className={cn('trim-ruler', className)}>
      <div className="trim-ruler__row">
        <TimecodeField label="In" onChange={setInDraft} onCommit={commitIn} value={inText} />
        <TimecodeField label="Out" onChange={setOutDraft} onCommit={commitOut} value={outText} />
        <span className="trim-ruler__duration">
          <span className="trim-ruler__duration-time">{formatTimecode(duration)}</span>
          <span className="trim-ruler__duration-seconds">{formatSeconds(duration)}</span>
        </span>
        <Segmented
          label="Trim mode"
          onValueChange={(value) => onModeChange?.(value as TrimRulerMode)}
          segments={[
            { value: 'trim', label: 'Trim' },
            { value: 'copy', label: 'Copy' },
          ]}
          value={mode}
        />
      </div>
      <Slider.Root
        className="trim-ruler__ruler"
        max={max}
        min={min}
        onValueChange={handleSliderChange}
        value={[inPoint, outPoint]}
      >
        <Slider.Track className="trim-ruler__track">
          <Slider.Range className="trim-ruler__range" />
        </Slider.Track>
        <Slider.Thumb aria-label="In point" className="trim-ruler__thumb" />
        <Slider.Thumb aria-label="Out point" className="trim-ruler__thumb" />
      </Slider.Root>
      {mode === 'copy' ? (
        <Callout severity="warning">
          Copy mode uses stream copy, so keyframes may fall outside the trim range
        </Callout>
      ) : null}
    </div>
  )
}
