#!/usr/bin/env node
/**
 * Generates the ffmpeg global-option details in src/spec/option-details.json
 * from the general options of the .cache help output.
 *
 * Reads the general options section of .cache/ffmpeg-help.txt, up to the
 * first `AVOptions:` section, which is not a general option. Records every
 * option name, aliases, value placeholder, default and description; names
 * are stored bare, without dashes.
 *
 * Writes src/spec/option-details.json with an `options` array and
 * `provenance` (version, helpCacheSha256, generatedAt).
 */

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const cacheDir = resolve(root, '.cache')
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

/**
 * Parses one option line of the general options of `ffmpeg -h full` output,
 * e.g. `-vcodec <codec>     alias for -c:v (select encoder/decoder for video
 * streams)`. Returns null when the line is not an option line.
 */
function parseOptionLine(line) {
  const match = line.match(/^\s*(-[^\s]+)(?:\s+(.*))?$/)
  if (!match) {
    return null
  }
  const entry = { name: match[1].replace(/\[:[^\]]*\]$/, '').replace(/^-+/, '') }
  let rest = match[2] ?? ''

  const metavarMatch = rest.match(/^\s*(<[^>]*>)/)
  if (metavarMatch) {
    rest = rest.slice(metavarMatch[0].length)
    if (metavarMatch[1] !== '<>') {
      entry.metavar = metavarMatch[1].slice(1, -1)
    }
  }

  const defaultMatch = rest.match(/\(default ([^)]+)\)/)
  if (defaultMatch) {
    entry.default = defaultMatch[1]
    rest = rest.replace(/\s*\(default [^)]+\)/, '')
  }

  const aliasMatch = rest.match(/\balias for\s+([^\s(]+)/i)
  if (aliasMatch) {
    entry.aliases = [aliasMatch[1].replace(/^-+/, '')]
  }

  const description = rest.trim()
  if (description) {
    entry.description = description
  }
  return entry
}

/**
 * Parses the general options of the `ffmpeg -h full` output. Stops at the
 * first per-codec `*AVOptions:` section, which is not a general option.
 */
function parseGeneralOptions(text) {
  const options = []
  for (const line of text.split(/\r?\n/)) {
    if (line.trim().endsWith('AVOptions:')) {
      break
    }
    const entry = parseOptionLine(line)
    if (entry) {
      options.push(entry)
    }
  }
  return options
}

function main() {
  const help = readCache('ffmpeg-help.txt')
  const options = parseGeneralOptions(help)

  mkdirSync(specDir, { recursive: true })
  writeJson('option-details.json', {
    options,
    provenance: {
      version: VERSION,
      helpCacheSha256: createHash('sha256').update(help).digest('hex'),
      generatedAt: new Date().toISOString(),
    },
  })

  console.log(`options: ${options.length}`)
}

main()
