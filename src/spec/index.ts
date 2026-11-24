import type { ToolSpec } from '../core/types'
import optionsSpec from './options.json'

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

export const spec: Spec = optionsSpec as Spec
