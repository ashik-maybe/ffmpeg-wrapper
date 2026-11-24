/**
 * Selftest for the renderer: run node against the hostile names in
 * tests/fixtures/hostile-names.json and print each rendered command for the
 * posix, powershell and cmd shells.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render } from './index.ts'

const names = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../../tests/fixtures/hostile-names.json'),
    'utf8',
  ),
)

for (const shell of ['posix', 'powershell', 'cmd']) {
  for (const name of names) {
    const command = { tool: 'ffmpeg', args: [{ kind: 'value', name }] }
    console.log(`${shell}: ${render(command, shell)}`)
  }
}
