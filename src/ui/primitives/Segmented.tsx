import * as ToggleGroup from '@radix-ui/react-toggle-group'

export type Segment = {
  value: string
  label: string
}

export type SegmentedProps = {
  value: string
  onValueChange: (value: string) => void
  segments: readonly Segment[]
  label: string
}

export function Segmented({ value, onValueChange, segments, label }: SegmentedProps) {
  return (
    <ToggleGroup.Root
      type="single"
      className="ui-segmented"
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next)
      }}
      aria-label={label}
    >
      {segments.map((segment) => (
        <ToggleGroup.Item key={segment.value} value={segment.value} className="ui-segmented__item">
          {segment.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
