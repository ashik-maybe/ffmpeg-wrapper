# Contract: command IR and core modules

Date: 2026-11-24

This document defines the public types of the core, the interfaces of the
renderer and the validator, the error codes of findings, and the invariants
that the core modules keep. The core types file, `src/core/types.ts`, is
frozen after P1.

## Terms

- **IR**: an intermediate representation. A typed object. A renderer turns an
  IR into a command string.
- **Renderer**: a module. A renderer quotes values for one shell.
- **Validator**: a module. A validator returns findings for an IR.
- **Recipe**: a typed scenario. A recipe maps one user goal to IR arguments.
- **Plan**: a recipe plus the user's values.
- **Finding**: a review item. A finding names a problem and a file location.
- **Tool spec**: the record of every option of one tool version.

## Types (`src/core/types.ts`)

### `Shell`

```ts
type Shell = 'posix' | 'powershell' | 'cmd'
```

### `ArgKind`

```ts
type ArgKind = 'flag' | 'option' | 'value'
```

- `flag`: an option that takes no value.
- `option`: an option that takes a value.
- `value`: a bare word, not an option.

### `Arg`

One element of a command line.

```ts
interface Arg {
  readonly kind: ArgKind
  readonly name: string
  readonly value?: string
  readonly alias?: string
}
```

- `name`: the option spelling as it is written, for example `--vcodec` or
  `-c`.
- `value`: the value of an option or the text of a positional value.
- `alias`: the short spelling when one exists.

### `Command`

The full command line.

```ts
interface Command {
  readonly tool: string
  readonly args: readonly Arg[]
}
```

### `Recipe`

A typed scenario.

```ts
interface Recipe {
  readonly id: string
  readonly tool: string
  readonly args: readonly Arg[]
}
```

### `Plan`

A recipe plus the user's values.

```ts
interface Plan {
  readonly recipe: Recipe
  readonly args: readonly Arg[]
}
```

### `OptionSpec`

One option of a tool version, as recorded in the spec.

```ts
interface OptionSpec {
  readonly name: string
  readonly kind: ArgKind
  readonly aliases?: readonly string[]
  readonly metavar?: string
  readonly choices?: readonly string[]
  readonly default?: string
}
```

### `ToolSpec`

One tool version and every option it exposes.

```ts
interface ToolSpec {
  readonly tool: string
  readonly version: string
  readonly options: readonly OptionSpec[]
}
```

### `Severity`

```ts
type Severity = 'error' | 'warning' | 'info'
```

### `ErrorCode`

Stable machine-readable codes for findings.

```ts
type ErrorCode =
  | 'E_UNKNOWN_OPTION'
  | 'E_MISSING_VALUE'
  | 'E_INVALID_CHOICE'
  | 'E_CONFLICT'
  | 'E_REQUIRES'
  | 'E_UNVERIFIED'
```

### `Finding`

A review item.

```ts
interface Finding {
  readonly severity: Severity
  readonly code: ErrorCode
  readonly message: string
  readonly file: string
  readonly line?: number
}
```

### `Route`

A route into the app.

```ts
interface Route {
  readonly page: string
  readonly params: Readonly<Record<string, string>>
}
```

## Interfaces

### Renderer: `src/core/render/quote.ts` and `src/core/render/index.ts`

```ts
function quote(value: string, shell: Shell): string
function render(command: Command, shell: Shell): string
```

- `quote` wraps one value for the shell.
- `render` returns the whole command line, flags and values, for the shell.

### Validator: `src/core/validate/index.ts`

```ts
function validate(plan: Plan, spec: ToolSpec): Finding[]
```

Returns the findings of the plan. An empty array means the plan is valid.

### Plan: `src/core/plan.ts`

```ts
function planFromRecipe(recipe: Recipe, values: Record<string, string>): Plan
```

Returns the recipe plus the values filled into the arguments.

### Router: `src/core/router.ts`

```ts
function parseHash(hash: string): Route
function buildHash(route: Route): string
```

- `parseHash` turns a location hash into a route.
- `buildHash` turns a route into a location hash.

### Public API: `src/core/index.ts`

Re-exports the renderer, the validator, the plan helper, the router and the
types of this contract.

## Invariants

1. `src/core/types.ts` is frozen after P1. No agent changes it later.
2. Every stub has the real signature. Every stub throws
   `Error('NotImplemented: <name>')`.
3. The repo typechecks while the stubs exist.
4. `validate` returns `Finding[]`; every finding has a `severity` from
   `Severity`, a `code` from `ErrorCode`, and a `file` name.
5. `parseHash(buildHash(route))` round-trips: it yields a route equal to the
   input.
6. The design lint bans every pattern listed in `scripts/design-lint.mjs`.
