export interface RawArgSnippet {
  readonly id: string
  readonly label: string
  readonly flag: string
}

export const rawArgSnippets: readonly RawArgSnippet[] = [
  {
    id: 'movflags-faststart',
    label: 'Move metadata for web playback',
    flag: '-movflags +faststart',
  },
  {
    id: 'map-metadata-strip',
    label: 'Strip metadata',
    flag: '-map_metadata -1',
  },
  {
    id: 'force-keyframes-expr',
    label: 'Force keyframes by expression',
    flag: '-force_key_frames expr',
  },
  {
    id: 'filter-complex-script',
    label: 'Load filter graph from script',
    flag: '-filter_complex_script',
  },
  {
    id: 'disposition',
    label: 'Set stream disposition',
    flag: '-disposition',
  },
  {
    id: 'force-keyframes-chapters',
    label: 'Force keyframes at chapters',
    flag: '-force_key_frames chapters',
  },
]
