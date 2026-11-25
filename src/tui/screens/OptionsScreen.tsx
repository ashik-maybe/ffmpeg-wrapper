import { Box, Text } from 'ink'
import { KeyHint, StatusBar } from '../components/index.ts'

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
}

function Field({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <Box>
      <Box width={14}>
        <Text>{label}:</Text>
      </Box>
      <Text>{value === '' ? '-' : value}</Text>
    </Box>
  )
}

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
}: OptionsScreenProps) {
  return (
    <Box flexDirection="column">
      <StatusBar left="FFmpeg TUI" right="Options (POSIX)" />
      <Box flexDirection="column" marginTop={1}>
        <Field label="Input path" value={inputPath} />
        <Field label="Output path" value={outputPath} />
        <Field label="In point" value={inPoint} />
        <Field label="Out point" value={outPoint} />
        <Field label="Copy mode" value={mode} />
        <Field label="Raw args" value={rawArgs} />
      </Box>
      <Box marginTop={1}>
        <KeyHint keys="POSIX" label="shell only" />
      </Box>
    </Box>
  )
}
