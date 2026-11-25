import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const specDir = resolve(root, 'src/spec')

const readSpec = (file) => JSON.parse(readFileSync(resolve(specDir, file), 'utf8'))

const options = readSpec('options.json')
const filters = readSpec('filters.json')
const encoders = readSpec('encoders.json')
const muxers = readSpec('muxers.json')
const hwaccels = readSpec('hwaccels.json')
const filterDetails = readSpec('filter-details.json').filters
const encoderDetails = readSpec('encoder-details.json').encoders

console.log(`options: ${options.options.length}`)
console.log(`filters: ${filters.length}`)
console.log(`encoders: ${encoders.length}`)
console.log(`muxers: ${muxers.length}`)
console.log(`hwaccels: ${hwaccels.length}`)
console.log(`filterDetails: ${filterDetails.length}`)
console.log(`encoderDetails: ${encoderDetails.length}`)

if (filters.length <= 400) {
  throw new Error(`filters count is not above 400: ${filters.length}`)
}
if (encoders.length <= 100) {
  throw new Error(`encoders count is not above 100: ${encoders.length}`)
}
if (filterDetails.length < 480) {
  throw new Error(`filterDetails count is not above 480: ${filterDetails.length}`)
}
if (encoderDetails.length < 190) {
  throw new Error(`encoderDetails count is not above 190: ${encoderDetails.length}`)
}
