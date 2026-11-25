import { Box, Text, useInput } from 'ink'
import { KeyHint, StatusBar } from '../components/index.ts'

export interface OutcomeItem {
  readonly id: string
  readonly label: string
  readonly group?: string
}

export interface OutcomeScreenProps {
  readonly outcomes: readonly OutcomeItem[]
  readonly selectedId: string
  readonly onSelect: (id: string) => void
}

export function OutcomeScreen({ outcomes, selectedId, onSelect }: OutcomeScreenProps) {
  const index = Math.max(
    0,
    outcomes.findIndex((outcome) => outcome.id === selectedId),
  )

  useInput((_input, key) => {
    if (outcomes.length === 0) return
    if (key.upArrow) {
      const next = (index - 1 + outcomes.length) % outcomes.length
      const item = outcomes[next]
      if (item) onSelect(item.id)
      return
    }
    if (key.downArrow) {
      const next = (index + 1) % outcomes.length
      const item = outcomes[next]
      if (item) onSelect(item.id)
      return
    }
    if (key.return) {
      const item = outcomes[index]
      if (item) onSelect(item.id)
    }
  })

  const hasGroups = outcomes.some((outcome) => outcome.group !== undefined)

  return (
    <Box flexDirection="column">
      <StatusBar left="FFmpeg TUI" right="Outcomes" />
      <Box flexDirection="column" marginTop={1}>
        {outcomes.map((outcome, i) => {
          const selected = outcome.id === outcomes[index]?.id
          const marker = selected ? '>' : ' '
          const prevGroup = i > 0 ? outcomes[i - 1]?.group : undefined
          const showGroup = hasGroups && outcome.group !== prevGroup
          return (
            <Box key={outcome.id} flexDirection="column">
              {showGroup ? <Text>{outcome.group}</Text> : null}
              <Text>
                {marker} {i + 1}. {outcome.label}
              </Text>
            </Box>
          )
        })}
      </Box>
      <Box marginTop={1}>
        <KeyHint keys="Up/Down" label="move" />
        <Text> </Text>
        <KeyHint keys="Enter" label="select" />
      </Box>
    </Box>
  )
}
