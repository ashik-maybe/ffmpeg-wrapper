/**
 * Every user-facing string, as typed data.
 *
 * String rules for this file: sentence case, no exclamation marks, short
 * strings end without a period, no invented numbers, no user quotes, and
 * no words from scripts/design-lint.mjs. Counts are stated only where the
 * tool spec generates them.
 */
import type { ErrorCode } from '../core/types'

export interface Outcome {
  readonly id: string
  readonly label: string
}

export interface InstallLines {
  readonly macos: string
  readonly linux: string
  readonly windowsPowerShell: string
  readonly windowsCmd: string
}

export interface Paste {
  readonly copy: string
  readonly paste: string
}

export interface FilePathHelper {
  readonly dragIntoTerminal: string
  readonly copyAsPath: string
}

export interface ConfidenceLabels {
  readonly high: string
  readonly medium: string
  readonly low: string
}

export interface ContentButtons {
  readonly generate: string
  readonly copyCommand: string
  readonly runInTerminal: string
  readonly install: string
  readonly tryAgain: string
}

export interface Content {
  readonly heroHeading: string
  readonly heroBody: string
  readonly outcomes: readonly Outcome[]
  readonly qualityLabels: readonly string[]
  readonly install: InstallLines
  readonly paste: Paste
  readonly filePathHelper: FilePathHelper
  readonly warnings: Readonly<Record<ErrorCode, string>>
  readonly confidence: ConfidenceLabels
  readonly coverage: string
  readonly emptyState: string
  readonly errorState: string
  readonly buttons: ContentButtons
}

export const content: Content = {
  heroHeading: 'Describe the edit. Get a command that runs.',
  heroBody: 'Type the edit you want and the command is ready',
  outcomes: [
    { id: 'trim', label: 'Trim' },
    { id: 'crop', label: 'Crop' },
    { id: 'scale', label: 'Scale' },
    { id: 'concat', label: 'Concat' },
    { id: 'speed', label: 'Speed' },
  ],
  qualityLabels: ['Fast', 'Balanced', 'Accurate'],
  install: {
    macos: 'brew install ffmpeg',
    linux: 'sudo apt install ffmpeg',
    windowsPowerShell: 'winget install ffmpeg',
    windowsCmd: 'choco install ffmpeg',
  },
  paste: {
    copy: 'Press Ctrl+C or Cmd+C to copy',
    paste: 'Press Ctrl+V or Cmd+V in the terminal to paste',
  },
  filePathHelper: {
    dragIntoTerminal: 'Drag the file into the terminal to insert its path',
    copyAsPath: 'Copy as path',
  },
  warnings: {
    E_UNKNOWN_OPTION: 'The command uses an option this tool does not list',
    E_MISSING_VALUE: 'An option is missing its value',
    E_INVALID_CHOICE: 'The value is not in the list of choices',
    E_CONFLICT: 'Two options conflict',
    E_REQUIRES: 'This option needs another option',
    E_UNVERIFIED: 'The command was not verified',
  },
  confidence: {
    high: 'High confidence',
    medium: 'Medium confidence',
    low: 'Low confidence',
  },
  coverage: 'Every option is generated from the tool spec',
  emptyState: 'Describe the edit you want, for example trim the start of the clip',
  errorState: 'Something went wrong, try again',
  buttons: {
    generate: 'Generate command',
    copyCommand: 'Copy command',
    runInTerminal: 'Run in terminal',
    install: 'Install ffmpeg',
    tryAgain: 'Try again',
  },
}
