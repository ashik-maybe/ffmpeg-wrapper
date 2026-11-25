import { Box, Text } from 'ink'
import { theme } from '../theme.ts'

const KEYS: readonly { keys: string; label: string }[] = [
  { keys: 'Arrows', label: 'move selection' },
  { keys: 'Enter', label: 'select / confirm / run' },
  { keys: 'm', label: 'more tasks' },
  { keys: 'a', label: 'advanced options' },
  { keys: '?', label: 'toggle help' },
  { keys: 'Esc', label: 'back / close' },
  { keys: 'q', label: 'quit' },
  { keys: 'r', label: 'run' },
  { keys: 'Ctrl+C', label: 'quit' },
]

export function HelpOverlay() {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={theme.accent} paddingX={1}>
      <Text color={theme.accent}>Help</Text>
      <Box flexDirection="column" marginTop={1}>
        {KEYS.map((item) => (
          <Box key={item.keys}>
            <Box width={12}>
              <Text color={theme.muted}>{item.keys}</Text>
            </Box>
            <Text>{item.label}</Text>
          </Box>
        ))}
      </Box>
      <Box marginTop={1}>
        <Text color={theme.muted}>Close: ? or Esc</Text>
      </Box>
    </Box>
  )
}
