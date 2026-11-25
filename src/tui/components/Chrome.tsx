import type { ReactNode } from 'react'
import { Box, Text } from 'ink'
import { theme } from '../theme.ts'
import { KeyHint } from './KeyHint.tsx'

export interface ChromeHint {
  readonly keys: string
  readonly label: string
}

export interface ChromeProps {
  readonly version: string
  readonly step: number
  readonly total: number
  readonly right?: string
  readonly hints: readonly ChromeHint[]
  readonly children: ReactNode
}

export function Chrome({ version, step, total, right, hints, children }: ChromeProps) {
  const stepLabel = `Step ${step} of ${total}`
  return (
    <Box flexDirection="column">
      <Box justifyContent="space-between" width="100%">
        <Box>
          <Text color={theme.accent}>FFmpeg TUI</Text>
          <Text color={theme.muted}> v{version}</Text>
        </Box>
        <Box>
          <Text color={theme.muted}>{stepLabel}</Text>
          {right ? <Text color={theme.muted}> | {right}</Text> : null}
        </Box>
      </Box>
      <Box flexDirection="column" marginTop={1}>
        {children}
      </Box>
      <Box marginTop={1} flexWrap="wrap">
        {hints.map((hint, i) => (
          <Box key={`${hint.keys}-${hint.label}`} marginRight={i < hints.length - 1 ? 1 : 0}>
            <KeyHint keys={hint.keys} label={hint.label} />
          </Box>
        ))}
      </Box>
    </Box>
  )
}
