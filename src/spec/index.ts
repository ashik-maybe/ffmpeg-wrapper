import type { ToolSpec } from '../core/types'
import optionsSpec from './options.json'
import filterDetailsSpec from './filter-details.json'
import encoderDetailsSpec from './encoder-details.json'
import streamSpecsData from './stream-specs.json'
import optionDetailsData from './option-details.json'

export interface SpecProvenance {
  readonly version: string
  readonly codename: string
  readonly releaseDate: string
  readonly source: string
  readonly generatedAt: string
  readonly helpCacheSha256: string
}

export interface Spec extends ToolSpec {
  readonly provenance: SpecProvenance
}

export interface FilterOptionDetail {
  readonly name: string
  readonly type?: string
  readonly markers?: string
  readonly default?: string
  readonly description?: string
  readonly aliases?: readonly string[]
}

export interface FilterDetail {
  readonly name: string
  readonly options: readonly FilterOptionDetail[]
}

export interface EncoderDetail {
  readonly name: string
  readonly options: readonly FilterOptionDetail[]
}

export interface DetailsProvenance {
  readonly version: string
  readonly filtersCacheSha256: string
  readonly encodersCacheSha256: string
  readonly generatedAt: string
}

export const spec: Spec = optionsSpec as Spec

export const detailsProvenance = filterDetailsSpec.provenance as DetailsProvenance

export const filterDetails: readonly FilterDetail[] =
  filterDetailsSpec.filters as readonly FilterDetail[]

export const encoderDetails: readonly EncoderDetail[] =
  encoderDetailsSpec.encoders as readonly EncoderDetail[]

export interface StreamDetail {
  readonly name: string
  readonly type?: string
  readonly description?: string
}

export interface StreamSpecsProvenance {
  readonly version: string
  readonly sources?: readonly string[]
  readonly decodersCacheSha256: string
  readonly demuxersCacheSha256: string
  readonly protocolsCacheSha256: string
  readonly pixelFormatsCacheSha256: string
  readonly sampleFormatsCacheSha256: string
  readonly generatedAt: string
}

export interface StreamSpecs {
  readonly tool: string
  readonly version: string
  readonly provenance: StreamSpecsProvenance
  readonly decoders: readonly StreamDetail[]
  readonly demuxers: readonly StreamDetail[]
  readonly protocols: readonly StreamDetail[]
  readonly pixelFormats: readonly StreamDetail[]
  readonly sampleFormats: readonly StreamDetail[]
}

export const streamSpecs: StreamSpecs = streamSpecsData as StreamSpecs

export interface OptionDetail {
  readonly name: string
  readonly description?: string
  readonly metavar?: string
  readonly aliases?: readonly string[]
}

export interface OptionDetailsProvenance {
  readonly version: string
  readonly helpCacheSha256: string
  readonly generatedAt: string
}

export interface OptionDetailsFile {
  readonly options: readonly OptionDetail[]
  readonly provenance: OptionDetailsProvenance
}

export const optionDetails: readonly OptionDetail[] = (optionDetailsData as OptionDetailsFile)
  .options
