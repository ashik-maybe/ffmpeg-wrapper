import { Box, Text, useInput } from 'ink'
import { KeyHint, StatusBar } from '../components/index.ts'
import { theme } from '../theme.ts'

export interface OutcomeItem {
  readonly id: string
  readonly label: string
  readonly group?: string
}

export interface OutcomeScreenProps {
  readonly outcomes: readonly OutcomeItem[]
  readonly selectedId: string
  readonly onSelect: (id: string) => void
  readonly embedded?: boolean
}

export function OutcomeScreen({
  outcomes,
  selectedId,
  onSelect,
  embedded = false,
}: OutcomeScreenProps) {
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

  const list = (
    <Box flexDirection="column">
      {!embedded ? <StatusBar left="FFmpeg TUI" right="Outcomes" /> : null}
      <Box flexDirection="column" marginTop={embedded ? 0 : 1}>
        {hasGroups ? null : <Text color={theme.muted}>{outcomes.length} outcomes</Text>}
        {outcomes.map((outcome, i) => {
          const selected = outcome.id === outcomes[index]?.id
          const prevGroup = i > 0 ? outcomes[i - 1]?.group : undefined
          const showGroup = hasGroups && outcome.group !== prevGroup
          return (
            <Box key={outcome.id} flexDirection="column">
              {showGroup ? (
                <Box marginTop={i > 0 ? 1 : 0}>
                  <Text color={theme.muted}>{outcome.group}</Text>
                  <Text color={theme.muted}>
                    {' '}
                    ({outcomes.filter((o) => o.group === outcome.group).length})
                  </Text>
                </Box>
              ) : null}
              <Text>
                <Text color={selected ? theme.accent : undefined}>{selected ? '>' : ' '}</Text>{' '}
                {i + 1}. {outcome.label}
              </Text>
            </Box>
          )
        })}
      </Box>
      {!embedded ? (
        <Box marginTop={1}>
          <KeyHint keys="Up/Down" label="move" />
          <Text> </Text>
          <KeyHint keys="Enter" label="select" />
        </Box>
      ) : null}
    </Box>
  )

  return list
}
