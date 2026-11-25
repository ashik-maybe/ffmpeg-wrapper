import { Box, Text } from 'ink'
import { StatusBar } from '../components/index.ts'

export interface ResultFinding {
  readonly severity: string
  readonly message: string
  readonly code?: string
}

export interface ProgressView {
  readonly time?: string
  readonly fps?: number
  readonly speed?: string
}

export interface ResultScreenProps {
  readonly command: string
  readonly findings: readonly ResultFinding[]
  readonly version: string
  readonly running: boolean
  readonly progress?: ProgressView | null
  readonly rawLog?: string
  readonly verification?: string
}

export function ResultScreen({
  command,
  findings,
  version,
  running,
  progress,
  rawLog = '',
  verification,
}: ResultScreenProps) {
  return (
    <Box flexDirection="column">
      <StatusBar left="FFmpeg TUI" right={running ? 'Running' : 'Result'} />
      <Box flexDirection="column" marginTop={1}>
        <Text>Version: {version}</Text>
        <Text>Status: {running ? 'Running' : 'Ready'}</Text>
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
        <Box marginTop={1} flexDirection="column">
          <Text>Progress:</Text>
          <Text>time: {progress?.time ?? '-'}</Text>
          <Text>fps: {progress?.fps !== undefined ? String(progress.fps) : '-'}</Text>
          <Text>speed: {progress?.speed ?? '-'}</Text>
        </Box>
        <Box marginTop={1} flexDirection="column">
          <Text>Raw log:</Text>
          <Text>{rawLog === '' ? '-' : rawLog}</Text>
        </Box>
        {verification !== undefined ? (
          <Box marginTop={1} flexDirection="column">
            <Text>Verification: {verification}</Text>
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}
