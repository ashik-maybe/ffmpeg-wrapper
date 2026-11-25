import { Box, Text } from 'ink'
import { KeyHint, StatusBar } from '../components/index.ts'
import { theme } from '../theme.ts'

export interface OptionsValues {
  readonly inputPath: string
  readonly outputPath: string
  readonly inPoint: string
  readonly outPoint: string
  readonly mode: string
  readonly rawArgs: string
}

export interface OptionsScreenProps extends OptionsValues {
  readonly onChange: (next: OptionsValues) => void
  readonly onInputPathChange?: (value: string) => void
  readonly onOutputPathChange?: (value: string) => void
  readonly activeField?: keyof OptionsValues
  readonly embedded?: boolean
  readonly advanced?: boolean
}

const FIELDS: readonly { key: keyof OptionsValues; label: string; hint: string }[] = [
  { key: 'inputPath', label: 'Input path', hint: 'source file' },
  { key: 'outputPath', label: 'Output path', hint: 'destination file' },
  { key: 'inPoint', label: 'In point', hint: 'start time' },
  { key: 'outPoint', label: 'Out point', hint: 'end time' },
  { key: 'mode', label: 'Copy mode', hint: 'copy or reencode' },
  { key: 'rawArgs', label: 'Raw args', hint: 'extra ffmpeg args' },
]

const ADVANCED_KEYS: readonly (keyof OptionsValues)[] = ['inPoint', 'outPoint', 'mode', 'rawArgs']

export function OptionsScreen({
  inputPath,
  outputPath,
  inPoint,
  outPoint,
  mode,
  rawArgs,
  onChange: _onChange,
  onInputPathChange: _onInputPathChange,
  onOutputPathChange: _onOutputPathChange,
  activeField,
  embedded = false,
  advanced = true,
}: OptionsScreenProps) {
  const values: OptionsValues = { inputPath, outputPath, inPoint, outPoint, mode, rawArgs }

  return (
    <Box flexDirection="column">
      {!embedded ? <StatusBar left="FFmpeg TUI" right="Options (POSIX)" /> : null}
      <Box flexDirection="column" marginTop={embedded ? 0 : 1}>
        {FIELDS.map((field) => {
          const isAdvancedField = ADVANCED_KEYS.includes(field.key)
          if (isAdvancedField && !advanced) return null
          const active = field.key === activeField
          const value = values[field.key]
          const prominent = field.key === 'inputPath' || field.key === 'outputPath'
          return (
            <Box key={field.key}>
              <Box width={2}>
                <Text color={active ? theme.accent : undefined}>{active ? '>' : ' '}</Text>
              </Box>
              <Box width={14}>
                <Text color={active ? theme.accent : prominent ? theme.accent : undefined}>
                  {field.label}:
                </Text>
              </Box>
              <Box minWidth={16}>
                <Text>{value === '' ? '-' : value}</Text>
              </Box>
              <Text color={theme.muted}> {field.hint}</Text>
            </Box>
          )
        })}
        {!advanced ? (
          <Box marginTop={1}>
            <Text color={theme.muted}>press a to edit advanced options</Text>
          </Box>
        ) : null}
      </Box>
      {!embedded ? (
        <Box marginTop={1}>
          <KeyHint keys="POSIX" label="shell only" />
        </Box>
      ) : null}
    </Box>
  )
}
