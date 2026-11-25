/**
 * Parsing for pasted tool output: ffmpeg -version, -encoders, and -filters.
 */

import { spec } from '../../spec'
import encoders from '../../spec/encoders.json'
import filters from '../../spec/filters.json'

type SpecEntry = {
  readonly name: string
}

const specEncoderNames = new Set((encoders as SpecEntry[]).map((entry) => entry.name))
const specFilterNames = new Set((filters as SpecEntry[]).map((entry) => entry.name))

export interface BuildCheckValues {
  /** Version token from the `ffmpeg version` line, when present. */
  readonly version?: string
  /** Encoder names found in `ffmpeg -encoders` output, in file order. */
  readonly encoders: readonly string[]
  /** Filter names found in `ffmpeg -filters` output, in file order. */
  readonly filters: readonly string[]
}

export interface BuildCheckSummary {
  /** True when any version, encoder, or filter was parsed. */
  readonly found: boolean
  /** Version token from the `ffmpeg version` line, when present. */
  readonly version?: string
  /** True when the pasted version equals the spec version. */
  readonly versionMatch: boolean
  /** Spec encoder names absent from the pasted build. */
  readonly missingEncoders: readonly string[]
  /** Spec filter names absent from the pasted build. */
  readonly missingFilters: readonly string[]
}

const ENCODERS_MARKER = 'Encoders:'
const FILTERS_MARKER = 'Filters:'

const FFMPEG_VERSION = /ffmpeg\s+version\s+([^\s]+)/

/**
 * Entry lines print `flags name  description`: flags and name, then at least
 * two spaces before the description.
 */
const ENTRY_LINE = /^[ \t]*[.A-Za-z|]*[ \t]+([a-z0-9_][a-z0-9_.-]*)[ \t]{2,}/

function parseVersion(text: string): string | undefined {
  const match = FFMPEG_VERSION.exec(text)
  return match === null ? undefined : match[1]
}

function parseNames(text: string): string[] {
  const names: string[] = []
  const seen = new Set<string>()
  for (const line of text.split('\n')) {
    const match = ENTRY_LINE.exec(line)
    if (match === null || seen.has(match[1])) continue
    seen.add(match[1])
    names.push(match[1])
  }
  return names
}

/** Text from a marker line to the next marker, or to the end of the text. */
function section(text: string, marker: string): string {
  const index = text.indexOf(marker)
  if (index < 0) return ''
  const rest = text.slice(index + marker.length)
  const next = rest.search(/Encoders:|Filters:/)
  return next < 0 ? rest : rest.slice(0, next)
}

export function parseBuildOutput(text: string): BuildCheckValues {
  return {
    version: parseVersion(text),
    encoders: parseNames(section(text, ENCODERS_MARKER)),
    filters: parseNames(section(text, FILTERS_MARKER)),
  }
}

/** Spec names absent from the pasted build, sorted. */
function missing(names: readonly string[], known: ReadonlySet<string>): readonly string[] {
  return [...known].filter((name) => !names.includes(name)).sort()
}

export function summarize(values: BuildCheckValues): BuildCheckSummary {
  return {
    found: values.version !== undefined || values.encoders.length > 0 || values.filters.length > 0,
    version: values.version,
    versionMatch: values.version === spec.version,
    missingEncoders: missing(values.encoders, specEncoderNames),
    missingFilters: missing(values.filters, specFilterNames),
  }
}
