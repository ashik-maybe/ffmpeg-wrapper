#!/usr/bin/env node
/**
 * Generates the ffmpeg spec JSONs in src/spec from the .cache help output.
 *
 * Reads .cache/ffmpeg-help.txt, ffmpeg-filters.txt, ffmpeg-encoders.txt,
 * ffmpeg-muxers.txt and ffmpeg-hwaccels.txt for the named outputs. The
 * remaining cache files are read and validated so the cache is complete.
 *
 * Writes src/spec/options.json, filters.json, encoders.json, muxers.json
 * and hwaccels.json.
 */

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const cacheDir = resolve(root, '.cache')
const specDir = resolve(root, 'src/spec')

const PROVENANCE = {
  version: '9.1',
  codename: 'Gauss',
  releaseDate: '2026-11-20',
  source: 'https://ffmpeg.org/download.html',
}

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

/**
 * Parses the general options from `ffmpeg -h long` output. Stops at the
 * per-codec `*AVOptions:` sections, which are not general options.
 */
function parseHelpOptions(text) {
  const options = []
  for (const line of text.split(/\r?\n/)) {
    if (line.trim().endsWith('AVOptions:')) {
      break
    }
    const match = line.match(/^\s*(-[^\s]+)(?:\s+(.*))?$/)
    if (!match) {
      continue
    }
    const name = match[1].replace(/\[:[^\]]*\]$/, '')
    const rest = match[2] ?? ''
    const entry = { name }
    const valueMatch = rest.match(/^\s*(<[^>]*>)\s*(.*)$/)
    if (valueMatch) {
      entry.kind = 'option'
      if (valueMatch[1] !== '<>') {
        entry.metavar = valueMatch[1].slice(1, -1)
      }
      const description = valueMatch[2].trim()
      if (description) {
        entry.description = description
      }
    } else {
      entry.kind = 'flag'
      const description = rest.trim()
      if (description) {
        entry.description = description
      }
    }
    options.push(entry)
  }
  return options
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

/** Parses `ffmpeg -encoders` and `ffmpeg -muxers` rows: `<marker> <name> <description>`. */
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

function main() {
  const caches = {
    help: readCache('ffmpeg-help.txt'),
    filters: readCache('ffmpeg-filters.txt'),
    encoders: readCache('ffmpeg-encoders.txt'),
    muxers: readCache('ffmpeg-muxers.txt'),
    decoders: readCache('ffmpeg-decoders.txt'),
    demuxers: readCache('ffmpeg-demuxers.txt'),
    protocols: readCache('ffmpeg-protocols.txt'),
    hwaccels: readCache('ffmpeg-hwaccels.txt'),
    pixFmts: readCache('ffmpeg-pix_fmts.txt'),
    sampleFmts: readCache('ffmpeg-sample_fmts.txt'),
  }
  const { help, filters, encoders, muxers, hwaccels } = caches

  const options = parseHelpOptions(help)
  const filterList = parseFilterList(filters)
  const encoderList = parseMarkerList(encoders)
  const muxerList = parseMarkerList(muxers)
  const hwaccelList = parseMarkerList(hwaccels)

  mkdirSync(specDir, { recursive: true })
  writeJson('options.json', {
    tool: 'ffmpeg',
    version: PROVENANCE.version,
    options,
    provenance: {
      ...PROVENANCE,
      generatedAt: new Date().toISOString(),
      helpCacheSha256: createHash('sha256').update(help).digest('hex'),
    },
  })
  writeJson('filters.json', filterList)
  writeJson('encoders.json', encoderList)
  writeJson('muxers.json', muxerList)
  writeJson('hwaccels.json', hwaccelList)

  console.log(`options: ${options.length}`)
  console.log(`filters: ${filterList.length}`)
  console.log(`encoders: ${encoderList.length}`)
  console.log(`muxers: ${muxerList.length}`)
  console.log(`hwaccels: ${hwaccelList.length}`)
}

main()
