/**
 * Every user-facing string, as typed data.
 *
 * String rules for this file: sentence case, no exclamation marks, short
 * strings end without a period, no invented numbers, no user quotes, and
 * no words from scripts/design-lint.mjs. Counts are stated only where the
 * tool spec generates them.
 */
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
  readonly paste: string
}

export interface FilePathHelper {
  readonly dragIntoTerminal: string
  readonly copyAsPath: string
}

export interface ConfidenceLabels {
  readonly high: string
}

export interface Content {
  readonly heroHeading: string
  readonly heroSupport: string
  readonly heroBody: string
  readonly outcomes: readonly Outcome[]
  readonly install: InstallLines
  readonly paste: Paste
  readonly filePathHelper: FilePathHelper
  readonly confidence: ConfidenceLabels
  readonly coverage: string
  readonly emptyState: string
  readonly errorState: string
}

export const content: Content = {
  heroHeading: 'FFmpeg command generator for video edits',
  heroSupport: 'For ffmpeg 9.1',
  heroBody: 'Type the edit you want and the command is ready',
  outcomes: [
    { id: 'trim', label: 'Trim' },
    { id: 'crop', label: 'Crop' },
    { id: 'scale', label: 'Scale' },
    { id: 'concat', label: 'Concatenate' },
    { id: 'speed', label: 'Speed' },
  ],
  install: {
    macos: 'brew install ffmpeg',
    linux: 'sudo apt install ffmpeg',
    windowsPowerShell: 'winget install ffmpeg',
    windowsCmd: 'choco install ffmpeg',
  },
  paste: {
    paste: 'Press Ctrl+V or Cmd+V in the terminal to paste',
  },
  filePathHelper: {
    dragIntoTerminal: 'Drag the file into the terminal to insert its path',
    copyAsPath: 'Copy as path',
  },
  confidence: {
    high: 'High confidence',
  },
  coverage: 'Every option is generated from the tool spec',
  emptyState: 'Describe the edit you want, for example trim the start of the clip',
  errorState: 'Recipe not found, try again',
}
