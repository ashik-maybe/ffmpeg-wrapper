#!/usr/bin/env node
/**
 * Generates the ffmpeg filter-details.json and encoder-details.json in
 * src/spec from `ffmpeg -h filter=NAME` and `ffmpeg -h encoder=NAME`.
 *
 * Reads the name lists from .cache/ffmpeg-filters.txt and
 * .cache/ffmpeg-encoders.txt. Runs tools/bin/ffmpeg for each name.
 *
 * --limit N runs the first N names (local runs). Default: all names.
 *
 * Writes src/spec/filter-details.json and src/spec/encoder-details.json.
 */

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const cacheDir = resolve(root, '.cache')
const binPath = resolve(root, 'tools/bin/ffmpeg')
const specDir = resolve(root, 'src/spec')

const VERSION = '9.1'

function readCache(name) {
  const text = readFileSync(resolve(cacheDir, name), 'utf8')
  if (text.trim() === '') {
    throw new Error(`cache file is empty: ${name}`)
  }
  return text
}

function writeJson(file, value) {
  writeFileSync(resolve(specDir, file), `${JSON.stringify(value, null, 2)}\n`)
}

/** Returns the data rows of a dash-list cache file, after the separator. */
function readRows(text) {
  const rows = []
  let inRows = false
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (/^-+$/.test(trimmed)) {
      inRows = true
      continue
    }
    if (inRows && trimmed) {
      rows.push(trimmed)
    }
  }
  return rows
}

/** Parses `ffmpeg -filters` rows: `<flags> <name> <type> <description>`. */
function parseFilterList(text) {
  return readRows(text).flatMap((row) => {
    const match = row.match(/^(\S+)\s+(\S+)\s+(.*)$/)
    if (!match) {
      return []
    }
    const tailMatch = match[3].trim().match(/^(\S+)(?:\s+(.*))?$/)
    const entry = { name: match[2] }
    if (tailMatch?.[1]) {
      entry.type = tailMatch[1]
    }
    const description = (tailMatch?.[2] ?? '').trim()
    if (description) {
      entry.description = description
    }
    return [entry]
  })
}

/** Parses `ffmpeg -encoders` rows: `<marker> <name> <description>`. */
function parseMarkerList(text) {
  return readRows(text).flatMap((row) => {
    const match = row.match(/^(\S+)\s+(\S+)(?:\s+(.*))?$/)
    if (!match) {
      return []
    }
    const entry = { name: match[2], type: match[1] }
    const description = (match[3] ?? '').trim()
    if (description) {
      entry.description = description
    }
    return [entry]
  })
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex')
}

/** True when the token looks like the option flags of the help output. */
function isMarkers(token) {
  return /^[.A-Za-z]+$/.test(token) && token.length >= 2 && token.includes('.')
}

/**
 * Parses one option line of a `ffmpeg -h filter=` or `ffmpeg -h encoder=`
 * output, e.g. `order <int> ..F.A...... set the filter order (default 16)`.
 * Returns null when the line is not an option line.
 */
function parseOptionLine(line) {
  const match = line.match(/^\s*(-?)([A-Za-z_][A-Za-z0-9_]*)\s+(.*)$/)
  if (!match) {
    return null
  }
  const entry = { name: match[2] }
  let rest = match[3]
  const typeMatch = rest.match(/^\s*<([^>]*)>\s*/)
  if (typeMatch) {
    entry.type = typeMatch[1]
    rest = rest.slice(typeMatch[0].length)
  } else {
    // Without a type, a leading token is a value unless it is markers.
    const valueMatch = rest.match(/^\s*(\S+)\s+(.*)$/)
    if (valueMatch && !isMarkers(valueMatch[1])) {
      entry.default = valueMatch[1]
      rest = valueMatch[2]
    }
  }
  const markersMatch = rest.match(/^\s*(\S+)(?:\s+(.*))?$/)
  if (markersMatch && isMarkers(markersMatch[1])) {
    entry.markers = markersMatch[1]
    rest = markersMatch[2] ?? ''
  }
  const defaultMatch = rest.match(/\(default ([^)]+)\)/)
  if (defaultMatch) {
    entry.default = defaultMatch[1]
    rest = rest.replace(/\s*\(default [^)]+\)/, '')
  }
  const description = rest.trim()
  if (description) {
    entry.description = description
  }
  return entry
}

/**
 * Parses the option lines of one `ffmpeg -h filter=` or `ffmpeg -h encoder=`
 * output. Returns the options and any aliases the help prints.
 */
function parseHelp(text) {
  const result = { options: [] }
  let inOptions = false
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (/AVOptions:\s*$/.test(trimmed)) {
      inOptions = true
      continue
    }
    if (inOptions && trimmed === '') {
      inOptions = false
      continue
    }
    if (!inOptions) {
      continue
    }
    const aliasMatch = trimmed.match(/^(?:aliases?|also known as)\s*[:=]\s*(.*)$/i)
    if (aliasMatch) {
      const aliases = aliasMatch[1]
        .split(/[,\s]+/)
        .map((name) => name.trim())
        .filter(Boolean)
      if (aliases.length > 0) {
        result.aliases = [...(result.aliases ?? []), ...aliases]
      }
      continue
    }
    const entry = parseOptionLine(line)
    if (entry) {
      result.options.push(entry)
    }
  }
  return result
}

function runFfmpeg(args) {
  return execFileSync(binPath, ['-hide_banner', ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
}

function buildDetails(name, kind, run) {
  const help = parseHelp(run(['-h', `${kind}=${name}`]))
  const entry = { name, options: help.options }
  if (help.aliases?.length) {
    entry.aliases = help.aliases
  }
  return entry
}

function parseLimit(argv) {
  let limit = null
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--limit') {
      limit = Number(argv[i + 1])
      i += 1
    } else if (arg.startsWith('--limit=')) {
      limit = Number(arg.slice('--limit='.length))
    }
  }
  return Number.isInteger(limit) && limit >= 0 ? limit : null
}

function main() {
  const limit = parseLimit(process.argv.slice(2))
  const filtersText = readCache('ffmpeg-filters.txt')
  const encodersText = readCache('ffmpeg-encoders.txt')
  const filters = parseFilterList(filtersText).slice(0, limit ?? undefined)
  const encoders = parseMarkerList(encodersText).slice(0, limit ?? undefined)

  const provenance = {
    version: VERSION,
    filtersCacheSha256: sha256(filtersText),
    encodersCacheSha256: sha256(encodersText),
    generatedAt: new Date().toISOString(),
  }

  mkdirSync(specDir, { recursive: true })
  writeJson('filter-details.json', {
    tool: 'ffmpeg',
    version: VERSION,
    provenance,
    filters: filters.map((entry) => buildDetails(entry.name, 'filter', runFfmpeg)),
  })
  writeJson('encoder-details.json', {
    tool: 'ffmpeg',
    version: VERSION,
    provenance,
    encoders: encoders.map((entry) => buildDetails(entry.name, 'encoder', runFfmpeg)),
  })

  console.log(`filters: ${filters.length}`)
  console.log(`encoders: ${encoders.length}`)
}

main()
