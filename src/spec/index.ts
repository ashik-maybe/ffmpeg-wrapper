import type { ToolSpec } from '../core/types'
import optionsSpec from './options.json'
import filterDetailsSpec from './filter-details.json'
import encoderDetailsSpec from './encoder-details.json'

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
