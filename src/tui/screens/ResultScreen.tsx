import { Box, Text } from 'ink'
import { StatusBar } from '../components/index.ts'
import { theme, glyphs } from '../theme.ts'

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
  readonly blockedReason?: string
  readonly unverified?: boolean
  readonly embedded?: boolean
  readonly showRawLog?: boolean
  readonly taskLabel?: string
}

function parseTimeSeconds(time: string | undefined): number {
  if (!time) return 0
  const parts = time.split(':').map((p) => Number(p))
  if (parts.length === 3) {
    return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0)
  }
  if (parts.length === 2) {
    return (parts[0] ?? 0) * 60 + (parts[1] ?? 0)
  }
  return 0
}

function progressBar(progress: ProgressView | null | undefined, running: boolean): string {
  const width = 20
  const seconds = parseTimeSeconds(progress?.time)
  const filled = running || seconds > 0 ? Math.max(1, Math.min(width, (seconds % width) + 1)) : 0
  const full = glyphs.barFull.repeat(filled)
  const empty = glyphs.barEmpty.repeat(width - filled)
  return `${glyphs.barLeft}${full}${empty}${glyphs.barRight}`
}

export function ResultScreen({
  command,
  findings,
  version,
  running,
  progress,
  rawLog = '',
  verification,
  blockedReason,
  unverified = false,
  embedded = false,
  showRawLog = true,
  taskLabel,
}: ResultScreenProps) {
  const status = running ? 'Running' : blockedReason ? 'Blocked' : 'Ready'
  const bar = progressBar(progress, running)
  const time = progress?.time ?? '-'
  const speed = progress?.speed ?? '-'
  const fps = progress?.fps !== undefined ? String(progress.fps) : '-'

  return (
    <Box flexDirection="column">
      {!embedded ? <StatusBar left="FFmpeg TUI" right={status} /> : null}
      <Box flexDirection="column" marginTop={embedded ? 0 : 1}>
        <Text>Version: {version}</Text>
        <Text>Status: {status}</Text>
        {blockedReason ? <Text color={theme.error}>Blocked: {blockedReason}</Text> : null}
        {unverified ? (
          <Text color={theme.accent}>Unverified hardware recipe - confirmation required</Text>
        ) : null}
        {taskLabel ? (
          <Box marginTop={1} flexDirection="column">
            <Text>Task: {taskLabel}</Text>
          </Box>
        ) : null}
        <Box marginTop={1} flexDirection="column">
          <Text>Command:</Text>
          <Text wrap="wrap">{command === '' ? '-' : command}</Text>
        </Box>
        <Box marginTop={1} flexDirection="column">
          <Text>Checks: Validation findings:</Text>
          {findings.length === 0 ? (
            <Text color={theme.muted}>None</Text>
          ) : (
            findings.map((finding, i) => (
              <Text key={`${finding.code ?? 'finding'}-${i}`}>
                <Text color={theme.muted}>- </Text>
                <Text color={finding.severity === 'error' ? theme.error : theme.muted}>
                  [{finding.severity}]
                </Text>{' '}
                {finding.message}
              </Text>
            ))
          )}
        </Box>
        <Box marginTop={1} flexDirection="column">
          <Text>Progress:</Text>
          <Text>
            {bar} time: {time} speed: {speed} fps: {fps}
          </Text>
        </Box>
        {showRawLog ? (
          <Box marginTop={1} flexDirection="column">
            <Text>Raw log:</Text>
            <Text wrap="wrap">{rawLog === '' ? '-' : rawLog}</Text>
          </Box>
        ) : null}
        {verification !== undefined ? (
          <Box marginTop={1} flexDirection="column">
            <Text>
              Verification:{' '}
              <Text color={verification === 'verified' ? theme.success : theme.error}>
                {verification}
              </Text>
            </Text>
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}
