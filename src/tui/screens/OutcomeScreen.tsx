import { Box, Text, useInput } from 'ink'
import { KeyHint, StatusBar } from '../components/index.ts'
import { theme } from '../theme.ts'

export interface OutcomeItem {
  readonly id: string
  readonly label: string
  readonly group?: string
  readonly hint?: string
}

export interface OutcomeScreenProps {
  readonly outcomes: readonly OutcomeItem[]
  readonly selectedId: string
  readonly onSelect: (id: string) => void
  readonly embedded?: boolean
  readonly onMore?: () => void
}

const MORE_ID = '__more__'

export function OutcomeScreen({
  outcomes,
  selectedId,
  onSelect,
  embedded = false,
  onMore,
}: OutcomeScreenProps) {
  const items: readonly OutcomeItem[] = onMore
    ? [...outcomes, { id: MORE_ID, label: 'More tasks...' }]
    : outcomes
  const index = Math.max(
    0,
    items.findIndex((outcome) => outcome.id === selectedId),
  )

  useInput((_input, key) => {
    if (items.length === 0) return
    if (key.upArrow) {
      const next = (index - 1 + items.length) % items.length
      const item = items[next]
      if (item) onSelect(item.id)
      return
    }
    if (key.downArrow) {
      const next = (index + 1) % items.length
      const item = items[next]
      if (item) onSelect(item.id)
      return
    }
    if (key.return) {
      const item = items[index]
      if (!item) return
      if (item.id === MORE_ID) {
        onMore?.()
        return
      }
      onSelect(item.id)
    }
  })

  const hasGroups = items.some((outcome) => outcome.group !== undefined)

  return (
    <Box flexDirection="column">
      {!embedded ? <StatusBar left="FFmpeg TUI" right="Outcomes" /> : null}
      <Box flexDirection="column" marginTop={embedded ? 0 : 1}>
        {hasGroups ? null : onMore ? null : (
          <Text color={theme.muted}>{items.length} outcomes</Text>
        )}
        {items.map((outcome, i) => {
          const selected = outcome.id === items[index]?.id
          const prevGroup = i > 0 ? items[i - 1]?.group : undefined
          const showGroup = hasGroups && outcome.group !== prevGroup
          return (
            <Box key={`${outcome.id}-${i}`} flexDirection="column">
              {showGroup ? (
                <Box marginTop={i > 0 ? 1 : 0}>
                  <Text color={theme.muted}>{outcome.group}</Text>
                </Box>
              ) : null}
              <Text>
                <Text color={selected ? theme.accent : undefined}>{selected ? '>' : ' '}</Text>{' '}
                {i + 1}. {outcome.label}
                {outcome.hint ? <Text color={theme.muted}> - {outcome.hint}</Text> : null}
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
}
