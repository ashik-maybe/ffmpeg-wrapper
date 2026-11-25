export interface ProgressUpdate {
  readonly raw: string
  readonly frame?: number
  readonly fps?: number
  readonly size?: string
  readonly time?: string
  readonly bitrate?: string
  readonly speed?: string
}

const PROGRESS_FIELDS = ['frame', 'fps', 'size', 'time', 'bitrate', 'speed'] as const

type ProgressField = (typeof PROGRESS_FIELDS)[number]

function parseNumber(value: string): number | undefined {
  if (value === 'N/A') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function extractField(line: string, field: ProgressField): string | undefined {
  const key = field === 'size' ? 'L?size' : field
  const pattern = new RegExp(`(?:^|\\s)${key}=\\s*(\\S+)`)
  const match = pattern.exec(line)
  if (!match) return undefined
  const value = match[1]
  if (value === undefined || value === 'N/A') return undefined
  return value
}

export function parseProgressLine(line: string): ProgressUpdate | null {
  try {
    const raw = line.replace(/\r/g, '').trimEnd()
    const normalized = raw.trim()
    if (normalized.length === 0) return null

    let found = false
    const update: {
      raw: string
      frame?: number
      fps?: number
      size?: string
      time?: string
      bitrate?: string
      speed?: string
    } = { raw }

    for (const field of PROGRESS_FIELDS) {
      const value = extractField(normalized, field)
      if (value === undefined) continue
      found = true
      if (field === 'frame' || field === 'fps') {
        const parsed = parseNumber(value)
        if (parsed !== undefined) update[field] = parsed
      } else {
        update[field] = value
      }
    }

    return found ? update : null
  } catch {
    return null
  }
}

export function latestProgressUpdate(lines: Iterable<string> | string): ProgressUpdate | null {
  try {
    const parts = typeof lines === 'string' ? lines.split(/\r\n|\r|\n/) : Array.from(lines)
    let latest: ProgressUpdate | null = null
    for (const line of parts) {
      const parsed = parseProgressLine(line)
      if (parsed !== null) latest = parsed
    }
    return latest
  } catch {
    return null
  }
}
