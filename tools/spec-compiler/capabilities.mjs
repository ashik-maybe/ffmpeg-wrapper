#!/usr/bin/env node
/**
 * Generates the ffmpeg stream-specs.json in src/spec from the .cache
 * decoders, demuxers, protocols, pix_fmts and sample_fmts listings.
 *
 * Reads .cache/ffmpeg-decoders.txt, .cache/ffmpeg-demuxers.txt,
 * .cache/ffmpeg-protocols.txt, .cache/ffmpeg-pix_fmts.txt and
 * .cache/ffmpeg-sample_fmts.txt.
 *
 * Writes src/spec/stream-specs.json: one array per kind — decoders,
 * demuxers, protocols, pixelFormats, sampleFormats — keeping the type
 * markers and names exactly as the caches print them.
 */

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const cacheDir = resolve(root, '.cache')
const specDir = resolve(root, 'src/spec')

const VERSION = '9.1'

const CACHE_FILES = [
  'ffmpeg-decoders.txt',
  'ffmpeg-demuxers.txt',
  'ffmpeg-protocols.txt',
  'ffmpeg-pix_fmts.txt',
  'ffmpeg-sample_fmts.txt',
]

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

function sha256(text) {
  return createHash('sha256').update(text).digest('hex')
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

/**
 * Parses marker rows of `ffmpeg -decoders`, `ffmpeg -demuxers` and
 * `ffmpeg -pix_fmts`: `<marker> <name> <description>`.
 */
function parseMarkerRows(text) {
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

/**
 * Parses `ffmpeg -protocols`: the names under the `Input:` and `Output:`
 * headings.
 */
function parseProtocols(text) {
  const protocols = []
  let section = null
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (/^(Input|Output):$/.test(trimmed)) {
      section = trimmed.slice(0, -1)
      continue
    }
    if (section && trimmed && /^\S+$/.test(trimmed)) {
      protocols.push({ type: section, name: trimmed })
    }
  }
  return protocols
}

/** Parses the `ffmpeg -sample_fmts` rows after the `name depth` header. */
function parseSampleFormats(text) {
  const formats = []
  let first = true
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed) {
      continue
    }
    if (first) {
      first = false
      continue
    }
    const match = trimmed.match(/^(\S+)\s+(.*)$/)
    if (match) {
      formats.push({ name: match[1], depth: match[2].trim() })
    }
  }
  return formats
}

function main() {
  const caches = {
    decoders: readCache('ffmpeg-decoders.txt'),
    demuxers: readCache('ffmpeg-demuxers.txt'),
    protocols: readCache('ffmpeg-protocols.txt'),
    pixelFormats: readCache('ffmpeg-pix_fmts.txt'),
    sampleFormats: readCache('ffmpeg-sample_fmts.txt'),
  }

  const provenance = {
    version: VERSION,
    sources: CACHE_FILES,
    decodersCacheSha256: sha256(caches.decoders),
    demuxersCacheSha256: sha256(caches.demuxers),
    protocolsCacheSha256: sha256(caches.protocols),
    pixelFormatsCacheSha256: sha256(caches.pixelFormats),
    sampleFormatsCacheSha256: sha256(caches.sampleFormats),
    generatedAt: new Date().toISOString(),
  }

  const spec = {
    tool: 'ffmpeg',
    version: VERSION,
    provenance,
    decoders: parseMarkerRows(caches.decoders),
    demuxers: parseMarkerRows(caches.demuxers),
    protocols: parseProtocols(caches.protocols),
    pixelFormats: parseMarkerRows(caches.pixelFormats),
    sampleFormats: parseSampleFormats(caches.sampleFormats),
  }

  mkdirSync(specDir, { recursive: true })
  writeJson('stream-specs.json', spec)

  console.log(`decoders: ${spec.decoders.length}`)
  console.log(`demuxers: ${spec.demuxers.length}`)
  console.log(`protocols: ${spec.protocols.length}`)
  console.log(`pixelFormats: ${spec.pixelFormats.length}`)
  console.log(`sampleFormats: ${spec.sampleFormats.length}`)
}

main()
