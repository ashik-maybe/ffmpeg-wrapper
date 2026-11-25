export interface RuntimeSpec {
  readonly version: string
  readonly options: readonly string[]
  readonly filters: readonly string[]
  readonly encoders: readonly string[]
  readonly muxers: readonly string[]
  readonly demuxers: readonly string[]
  readonly protocols: readonly string[]
  readonly hwaccels: readonly string[]
  readonly pixFmts: readonly string[]
  readonly sampleFmts: readonly string[]
}

export interface RuntimeSpecProvenance {
  readonly version: string
  readonly generatedAt: string
  readonly cacheKey: string
  readonly outputs: Readonly<Record<string, string>>
}

export interface CompiledRuntimeSpec {
  readonly spec: RuntimeSpec
  readonly provenance: RuntimeSpecProvenance
}
