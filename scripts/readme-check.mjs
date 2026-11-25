import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readmePath = resolve(root, 'README.md')
const readme = readFileSync(readmePath, 'utf8')

const required = [
  '--version',
  '--help',
  '--run',
  '--yes',
  '--force',
  '--unsafe',
  'Input path',
  'Output path',
  'Ctrl+C',
  'unbound placeholder',
  'overwrite',
  'ffprobe',
  'hardware confirmation',
  'network recipe',
  'raw arguments unverified',
  'bun run ci',
  'bun run tui:test',
  'bunx playwright test',
  'bun run spec:check',
]

const missing = required.filter((value) => !readme.includes(value))

console.log(`README strings checked: ${required.length}`)
console.log(`README strings missing: ${missing.length}`)

if (missing.length > 0) {
  for (const value of missing) {
    console.error(`missing: ${value}`)
  }
  process.exit(1)
}
