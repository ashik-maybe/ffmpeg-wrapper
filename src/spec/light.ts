import optionsSpec from './options.json'

/** The small spec view used by interface code. It excludes detail indices. */
export const spec = optionsSpec as { readonly version: string; readonly tool: string }
