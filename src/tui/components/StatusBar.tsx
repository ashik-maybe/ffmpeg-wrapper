import { Box, Text } from 'ink'

export interface StatusBarProps {
  readonly left: string
  readonly right?: string
}

export function StatusBar({ left, right }: StatusBarProps) {
  return (
    <Box justifyContent="space-between" width="100%">
      <Text>{left}</Text>
      <Text>{right ?? ''}</Text>
    </Box>
  )
}
