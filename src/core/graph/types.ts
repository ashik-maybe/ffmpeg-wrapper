/**
 * Local types for the filter graph compiler.
 *
 * `src/core/types.ts` is frozen, so the graph module defines its own types
 * here: a `FilterNode` per filter, a `Graph` as its ordered node list plus
 * unbalanced-label indexes, and `Finding` for `validateGraph`.
 */

/**
 * One filter in a graph: leading input labels, the filter name, the option
 * string, and the output label it publishes, when it has one.
 */
export interface FilterNode {
  /** Labels in front of the filter name, e.g. `[a]` and `[b]` on a two-input filter. */
  readonly labelIns: readonly string[]
  /** Filter name as written, e.g. `scale` or `drawtext`. */
  readonly name: string
  /** Option string as written after `=`; escapes are preserved as they appear. */
  readonly options: string
  /** Label after the filter, e.g. `[out]`. Absent when the filter is unlabeled. */
  readonly labelOut?: string
}

/**
 * A parsed filter graph: nodes in source order, plus the indexes of nodes
 * whose labels were left unterminated.
 */
export interface Graph {
  readonly nodes: readonly FilterNode[]
  /** Indexes into `nodes` of filters with an unterminated label. */
  readonly unbalanced: readonly number[]
}

export type FindingCode =
  | 'G_UNBALANCED_LABEL'
  | 'G_UNKNOWN_FILTER'
  | 'G_DUPLICATE_OUTPUT_LABEL'
  | 'G_UNMATCHED_INPUT'

/** A single problem found in a graph. */
export interface Finding {
  readonly severity: 'error'
  readonly code: FindingCode
  readonly message: string
  /** Index into the graph's `nodes` array. */
  readonly index: number
}
