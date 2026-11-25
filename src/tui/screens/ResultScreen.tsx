import { Box, Text } from 'ink'
import { StatusBar } from '../components/index.ts'

export interface ResultFinding {
  readonly severity: string
  readonly message: string
  readonly code?: string
}

export interface ResultScreenProps {
  readonly command: string
  readonly findings: readonly ResultFinding[]
  readonly version: string
  readonly running: boolean
}

export function ResultScreen({ command, findings, version, running }: ResultScreenProps) {
  return (
    <Box flexDirection="column">
      <StatusBar left="FFmpeg TUI" right={running ? 'Running' : 'Result'} />
      <Box flexDirection="column" marginTop={1}>
        <Text>Version: {version}</Text>
        <Box marginTop={1} flexDirection="column">
          <Text>Command:</Text>
          <Text>{command === '' ? '-' : command}</Text>
        </Box>
        <Box marginTop={1} flexDirection="column">
          <Text>Validation findings:</Text>
          {findings.length === 0 ? (
            <Text>None</Text>
          ) : (
            findings.map((finding, i) => (
              <Text key={`${finding.code ?? 'finding'}-${i}`}>
                - [{finding.severity}] {finding.message}
              </Text>
            ))
          )}
        </Box>
      </Box>
    </Box>
  )
}
