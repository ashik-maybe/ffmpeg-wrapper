/**
 * Parsing for pasted tool output: ffprobe text or JSON, and ffmpeg -version.
 */

export interface CalibrationValues {
  /** Duration in seconds, when present. */
  readonly duration?: number
  /** Width in pixels, when present. */
  readonly width?: number
  /** Height in pixels, when present. */
  readonly height?: number
  /** Codec names in stream order, when present. */
  readonly codecs?: readonly string[]
  /** The version token from `ffmpeg version ...`, when present. */
  readonly version?: string
}

type MutableValues = { -readonly [K in keyof CalibrationValues]: CalibrationValues[K] }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Numbers may arrive as strings. Accepts plain numbers and hh:mm:ss[.fraction]. */
function toNumber(value: unknown): number | undefined {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined
  const text = String(value).trim()
  if (text === '') return undefined
  const direct = Number(text)
  if (Number.isFinite(direct)) return direct
  const mmss = /^(\d{1,3}):(\d{2}(?:\.\d+)?)$/.exec(text)
  if (mmss !== null) {
    const minutes = Number(mmss[1])
    const seconds = Number(mmss[2])
    if (Number.isFinite(minutes) && Number.isFinite(seconds)) return minutes * 60 + seconds
  }
  const hhmmss = /^(\d{1,3}):(\d{2}):(\d{2}(?:\.\d+)?)$/.exec(text)
  if (hhmmss !== null) {
    const hours = Number(hhmmss[1])
    const minutes = Number(hhmmss[2])
    const seconds = Number(hhmmss[3])
    if (Number.isFinite(hours) && Number.isFinite(minutes) && Number.isFinite(seconds)) {
      return hours * 3600 + minutes * 60 + seconds
    }
  }
  return undefined
}

const TEXT_LINE = /^([A-Za-z][A-Za-z0-9_]*)=(.*)$/gm
const FFMPEG_VERSION = /^ffmpeg\s+version\s+([^\s]+)/

/** ffprobe prints `key=value` lines, both in `[STREAM]` and `[FORMAT]` blocks. */
function scanText(text: string): MutableValues {
  const values: MutableValues = {}
  const fields = new Map<string, string>()
  const codecs: string[] = []
  const seen = new Set<string>()
  let match: RegExpExecArray | null
  while ((match = TEXT_LINE.exec(text)) !== null) {
    const key = match[1].toLowerCase()
    const value = match[2].trim()
    if (!fields.has(key)) fields.set(key, value)
    if (key === 'codec_name' && value !== '' && !seen.has(value)) {
      seen.add(value)
      codecs.push(value)
    }
  }
  const duration = toNumber(fields.get('duration'))
  if (duration !== undefined) values.duration = duration
  const width = toNumber(fields.get('width'))
  if (width !== undefined) values.width = width
  const height = toNumber(fields.get('height'))
  if (height !== undefined) values.height = height
  if (codecs.length > 0) values.codecs = codecs
  return values
}

function versionFromText(text: string): string | undefined {
  const match = FFMPEG_VERSION.exec(text)
  return match === null ? undefined : match[1]
}

function pickFromRecord(
  record: Record<string, unknown>,
  values: MutableValues,
  codecs: Set<string>,
): void {
  if (values.duration === undefined) {
    const duration = toNumber(record.duration)
    if (duration !== undefined) values.duration = duration
  }
  if (values.width === undefined) {
    const width = toNumber(record.width)
    if (width !== undefined) values.width = width
  }
  if (values.height === undefined) {
    const height = toNumber(record.height)
    if (height !== undefined) values.height = height
  }
  if (
    values.version === undefined &&
    typeof record.version === 'string' &&
    record.version.trim() !== ''
  ) {
    values.version = record.version.trim()
  }
  const codecName = record.codec_name
  if (typeof codecName === 'string' && codecName.trim() !== '') codecs.add(codecName.trim())
}

/** ffprobe JSON: a `streams` array plus a `format` object, or a single stream record. */
function scanJson(root: unknown): CalibrationValues {
  const values: MutableValues = {}
  const codecs = new Set<string>()
  const containers: unknown[] = []
  if (isRecord(root)) {
    containers.push(root)
    if (Array.isArray(root.streams)) containers.push(...root.streams)
    if (isRecord(root.format)) containers.push(root.format)
  }
  for (const container of containers) {
    if (!isRecord(container)) continue
    pickFromRecord(container, values, codecs)
  }
  if (codecs.size > 0) values.codecs = [...codecs]
  return values
}

function tryJson(text: string): unknown | undefined {
  try {
    return JSON.parse(text) as unknown
  } catch {
    return undefined
  }
}

export function parseToolOutput(text: string): CalibrationValues {
  const trimmed = text.trim()
  if (trimmed === '') return {}
  const asJson = tryJson(trimmed)
  if (asJson !== undefined) return scanJson(asJson)
  const values = scanText(trimmed)
  const version = versionFromText(trimmed)
  if (version !== undefined) values.version = version
  return values
}
