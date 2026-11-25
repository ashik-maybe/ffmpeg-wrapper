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
const streamSpecs = readSpec('stream-specs.json')
const optionDetails = readSpec('option-details.json').options

console.log(`options: ${options.options.length}`)
console.log(`filters: ${filters.length}`)
console.log(`encoders: ${encoders.length}`)
console.log(`muxers: ${muxers.length}`)
console.log(`hwaccels: ${hwaccels.length}`)
console.log(`filterDetails: ${filterDetails.length}`)
console.log(`encoderDetails: ${encoderDetails.length}`)
console.log(`decoders: ${streamSpecs.decoders.length}`)
console.log(`demuxers: ${streamSpecs.demuxers.length}`)
console.log(`protocols: ${streamSpecs.protocols.length}`)
console.log(`pixelFormats: ${streamSpecs.pixelFormats.length}`)
console.log(`sampleFormats: ${streamSpecs.sampleFormats.length}`)
console.log(`optionDetails: ${optionDetails.length}`)

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
if (streamSpecs.decoders.length <= 500) {
  throw new Error(`decoders count is not above 500: ${streamSpecs.decoders.length}`)
}
if (streamSpecs.demuxers.length <= 300) {
  throw new Error(`demuxers count is not above 300: ${streamSpecs.demuxers.length}`)
}
if (streamSpecs.protocols.length <= 20) {
  throw new Error(`protocols count is not above 20: ${streamSpecs.protocols.length}`)
}
if (streamSpecs.pixelFormats.length <= 100) {
  throw new Error(`pixelFormats count is not above 100: ${streamSpecs.pixelFormats.length}`)
}
if (streamSpecs.sampleFormats.length <= 5) {
  throw new Error(`sampleFormats count is not above 5: ${streamSpecs.sampleFormats.length}`)
}
if (optionDetails.length < 201) {
  throw new Error(`optionDetails count is below 201: ${optionDetails.length}`)
}
