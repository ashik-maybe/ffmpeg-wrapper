export const theme = {
  accent: 'cyan',
  muted: 'gray',
  error: 'red',
  success: 'green',
} as const

export const glyphs = {
  marker: '>',
  barFull: '#',
  barEmpty: '-',
  barLeft: '[',
  barRight: ']',
  bullet: '-',
} as const

export type Theme = typeof theme
export type Glyphs = typeof glyphs
