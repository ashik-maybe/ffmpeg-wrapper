import { Box, Text } from 'ink'

export interface KeyHintProps {
  readonly keys: string
  readonly label: string
}

export function KeyHint({ keys, label }: KeyHintProps) {
  return (
    <Box>
      <Text>
        [{keys}] {label}
      </Text>
    </Box>
  )
}
