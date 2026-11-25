/**
 * Every user-facing string, as typed data.
 *
 * String rules for this file: sentence case, no exclamation marks, short
 * strings end without a period, no invented numbers, no user quotes, and
 * no words from scripts/design-lint.mjs. Counts are stated only where the
 * tool spec generates them.
 */
export interface OutcomeGroup {
  readonly id: 'Delivery' | 'Metadata' | 'Timing' | 'Graphs'
  readonly label: string
}

export interface Outcome {
  readonly id: string
  readonly label: string
  readonly group?: OutcomeGroup['id']
  readonly recipeId?: string
  readonly sentence?: string
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
  heroHeading: 'ffmpeg-wrapper for video edits',
  heroSupport: 'For ffmpeg 9.1',
  heroBody: 'Type the edit you want and the command is ready',
  outcomes: [
    {
      id: 'faststart',
      label: 'Prepare for web playback',
      group: 'Delivery',
      recipeId: 'faststart',
      sentence: 'Move metadata to the start of the file',
    },
    {
      id: 'explicit-map',
      label: 'Map streams explicitly',
      group: 'Delivery',
      recipeId: 'explicit-map',
      sentence: 'Select video and audio streams by index',
    },
    {
      id: 'hls',
      label: 'Package as HLS',
      group: 'Delivery',
      recipeId: 'hls',
      sentence: 'Split video into HTTP Live Streaming segments',
    },
    {
      id: 'dash',
      label: 'Package as DASH',
      group: 'Delivery',
      recipeId: 'dash',
      sentence: 'Split video into MPEG-DASH segments',
    },
    {
      id: 'strip-metadata',
      label: 'Strip metadata',
      group: 'Metadata',
      recipeId: 'strip-metadata',
      sentence: 'Remove metadata from the file',
    },
    {
      id: 'set-metadata',
      label: 'Set metadata',
      group: 'Metadata',
      recipeId: 'set-metadata',
      sentence: 'Write title and language metadata',
    },
    {
      id: 'disposition',
      label: 'Set stream disposition',
      group: 'Metadata',
      recipeId: 'disposition',
      sentence: 'Mark a stream as the default',
    },
    {
      id: 'embed-subtitles',
      label: 'Embed subtitles',
      group: 'Metadata',
      recipeId: 'embed-subtitles',
      sentence: 'Add a subtitle track to the file',
    },
    {
      id: 'force-keyframes',
      label: 'Force keyframes',
      group: 'Timing',
      recipeId: 'force-keyframes',
      sentence: 'Insert keyframes at a fixed interval',
    },
    {
      id: 'copyts',
      label: 'Keep timestamps',
      group: 'Timing',
      recipeId: 'copyts',
      sentence: 'Copy input timestamps without adjustment',
    },
    {
      id: 'avoid-negative-ts',
      label: 'Shift timestamps',
      group: 'Timing',
      recipeId: 'avoid-negative-ts',
      sentence: 'Move timestamps to avoid negative values',
    },
    {
      id: 'trim-copy',
      label: 'Trim without re-encoding',
      group: 'Timing',
      recipeId: 'trim-copy',
      sentence: 'Cut a section by copying streams',
    },
    {
      id: 'side-by-side',
      label: 'Stack side by side',
      group: 'Graphs',
      recipeId: 'side-by-side',
      sentence: 'Place two videos next to each other',
    },
    {
      id: 'filter-script',
      label: 'Apply filter script',
      group: 'Graphs',
      recipeId: 'filter-script',
      sentence: 'Run a filter graph from a script file',
    },
    {
      id: 'loop-image',
      label: 'Loop an image',
      group: 'Graphs',
      recipeId: 'loop-image',
      sentence: 'Repeat a still image as video input',
    },
    {
      id: 'lavfi-null-test',
      label: 'Test a generated source',
      group: 'Graphs',
      recipeId: 'lavfi-null-test',
      sentence: 'Run a generated test source to a null output',
    },
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
