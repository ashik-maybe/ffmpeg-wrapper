import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Text, useApp, useInput } from 'ink'
import { OutcomeScreen, OptionsScreen, ResultScreen } from './screens/index.ts'
import type { OptionsValues, ResultFinding } from './screens/index.ts'
import { recipes } from '../recipes/index.ts'
import { content } from '../content/index.ts'
import { planFromRecipe, render, validate } from '../core/index.ts'
import type { Plan, Recipe } from '../core/index.ts'
import { validateAgainstRuntime } from '../tools/index.ts'
import type { RuntimeSpec } from '../tools/index.ts'
import { runProcess } from '../runner/index.ts'
import type { RunResult } from '../runner/index.ts'
import { parseProgressLine } from '../progress/index.ts'

export type Screen = 'outcome' | 'options' | 'result'

export interface AppProps {
  readonly recipes?: readonly Recipe[]
  readonly runEnabled?: boolean
  readonly yes?: boolean
  readonly version?: string
  readonly spec?: RuntimeSpec
  readonly onRun?: (argv: readonly string[]) => Promise<RunResult>
}

const OPTION_FIELDS: readonly (keyof OptionsValues)[] = [
  'filePath',
  'inPoint',
  'outPoint',
  'mode',
  'rawArgs',
]

function defaultOutput(filePath: string): string {
  if (filePath.trim() === '') return 'output.mp4'
  const dot = filePath.lastIndexOf('.')
  if (dot <= 0) return `${filePath}.out.mp4`
  return `${filePath.slice(0, dot)}.out${filePath.slice(dot)}`
}

function buildValues(opts: OptionsValues): Record<string, string> {
  const out = defaultOutput(opts.filePath)
  return {
    input: opts.filePath,
    output: out,
    list: opts.filePath,
    start: opts.inPoint,
    ss: opts.inPoint,
    end: opts.outPoint,
    to: opts.outPoint,
    duration: opts.outPoint,
    mode: opts.mode,
  }
}

function parseRawArgs(raw: string): string[] {
  const tokens: string[] = []
  let current = ''
  let quote: "'" | '"' | null = null
  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i]!
    if (quote) {
      if (ch === quote) {
        quote = null
      } else {
        current += ch
      }
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      continue
    }
    if (/\s/.test(ch)) {
      if (current !== '') {
        tokens.push(current)
        current = ''
      }
      continue
    }
    current += ch
  }
  if (current !== '') tokens.push(current)
  return tokens
}

function toArgv(plan: Plan, rawArgs: string): string[] {
  const argv: string[] = [plan.recipe.tool]
  for (const arg of plan.args) {
    const name = arg.alias ?? arg.name
    const flag = name.startsWith('-') ? name : `-${name}`
    if (arg.kind === 'option' && arg.value !== undefined) {
      argv.push(flag, arg.value)
    } else if (arg.kind === 'value') {
      if (arg.name !== 'output') argv.push('-i')
      argv.push(arg.value ?? arg.name)
    } else {
      argv.push(flag)
    }
  }
  const extra = parseRawArgs(rawArgs)
  for (const token of extra) argv.push(token)
  return argv
}

function commandString(argv: readonly string[]): string {
  return argv
    .map((part) => (/[^\w@%+=:,./-]/.test(part) ? `'${part.replace(/'/g, "'\\''")}'` : part))
    .join(' ')
}

function buildPlan(
  recipe: Recipe,
  opts: OptionsValues,
): { plan: Plan; argv: string[]; command: string } {
  const values = buildValues(opts)
  const plan = planFromRecipe(recipe, values)
  const argv = toArgv(plan, opts.rawArgs)
  const base = render({ tool: plan.recipe.tool, args: plan.args }, 'posix')
  const extra = parseRawArgs(opts.rawArgs)
  const command = extra.length > 0 ? `${base} ${commandString(extra)}` : base
  return { plan, argv, command }
}

export function App({
  recipes: recipesProp,
  runEnabled = false,
  yes = false,
  version = 'unknown',
  spec,
  onRun,
}: AppProps) {
  const { exit } = useApp()
  const allRecipes = recipesProp ?? recipes
  const outcomeItems = useMemo(() => {
    if (recipesProp) {
      return allRecipes.map((r) => ({ id: r.id, label: r.id }))
    }
    const available = new Set(allRecipes.map((r) => r.id))
    return content.outcomes
      .filter((outcome) => outcome.recipeId && available.has(outcome.recipeId))
      .map((outcome) => ({
        id: outcome.recipeId as string,
        label: outcome.label,
        group: outcome.group,
      }))
  }, [allRecipes, recipesProp])
  const [screen, setScreen] = useState<Screen>('outcome')
  const [recipeId, setRecipeId] = useState<string>(outcomeItems[0]?.id ?? allRecipes[0]?.id ?? '')
  const [activeField, setActiveField] = useState(0)
  const [opts, setOpts] = useState<OptionsValues>({
    filePath: 'input.mp4',
    inPoint: '',
    outPoint: '',
    mode: 'copy',
    rawArgs: '',
  })
  const [runStatus, setRunStatus] = useState<string>('')
  const [running, setRunning] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [progress, setProgress] = useState<{ time?: string; fps?: number; speed?: string } | null>(
    null,
  )
  const [rawLog, setRawLog] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const ranRef = useRef(false)
  const stdoutBufferRef = useRef('')

  const selectedRecipe = useMemo(
    () => allRecipes.find((r) => r.id === recipeId) ?? allRecipes[0],
    [allRecipes, recipeId],
  )

  const { plan, argv, command } = useMemo(() => {
    if (!selectedRecipe) {
      return { plan: undefined, argv: [] as string[], command: '' }
    }
    return buildPlan(selectedRecipe, opts)
  }, [selectedRecipe, opts])

  const findings = useMemo(() => {
    if (!plan || !selectedRecipe) return [] as ResultFinding[]
    const core = validate(plan, { tool: selectedRecipe.tool, version: 'unknown', options: [] })
    const runtime = spec ? validateAgainstRuntime(spec, selectedRecipe) : []
    const seen = new Set<string>()
    const merged: ResultFinding[] = []
    for (const f of [...runtime, ...core]) {
      const key = `${f.code}:${f.message}`
      if (seen.has(key)) continue
      seen.add(key)
      merged.push({ severity: f.severity, message: f.message, code: f.code })
    }
    return merged
  }, [plan, selectedRecipe, spec])

  const doRun = useCallback(async () => {
    if (running || ranRef.current) return
    ranRef.current = true
    setHasRun(true)
    setRunning(true)
    setRunStatus('Running...')
    setProgress(null)
    setRawLog('')
    stdoutBufferRef.current = ''
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const onStdout = (chunk: string) => {
        setRawLog((prev) => prev + chunk)
        stdoutBufferRef.current += chunk
        const lines = stdoutBufferRef.current.split(/\r\n|\r|\n/)
        stdoutBufferRef.current = lines.pop() ?? ''
        for (const line of lines) {
          const update = parseProgressLine(line)
          if (update) {
            setProgress({ time: update.time, fps: update.fps, speed: update.speed })
          }
        }
      }
      const runner =
        onRun ??
        ((args: readonly string[]) =>
          runProcess([...args], { signal: controller.signal, onStdout }))
      const result = await runner(argv)
      const tail = stdoutBufferRef.current
      if (tail !== '') {
        const update = parseProgressLine(tail)
        if (update) {
          setProgress({ time: update.time, fps: update.fps, speed: update.speed })
        }
        stdoutBufferRef.current = ''
      }
      if (result.exitCode === 0) {
        setRunStatus(`Exit 0 (${result.durationMs}ms)`)
      } else {
        const err = result.error ? `: ${result.error}` : ''
        setRunStatus(`Exit ${result.exitCode}${err}`)
      }
    } catch (err) {
      setRunStatus(`Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setRunning(false)
      abortRef.current = null
    }
  }, [argv, onRun, running])

  useEffect(() => {
    if (screen === 'result' && runEnabled && yes && !ranRef.current) {
      void doRun()
    }
  }, [screen, runEnabled, yes, doRun])

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      if (abortRef.current) {
        abortRef.current.abort()
      }
      exit()
      return
    }

    if (screen === 'outcome') {
      if (key.return) {
        // OutcomeScreen also handles Enter; we confirm here.
        if (selectedRecipe) setScreen('options')
      }
      return
    }

    if (screen === 'options') {
      if (key.escape) {
        setScreen('outcome')
        return
      }
      if (key.return) {
        setScreen('result')
        return
      }
      if (key.tab || key.downArrow) {
        setActiveField((i) => (i + 1) % OPTION_FIELDS.length)
        return
      }
      if (key.upArrow) {
        setActiveField((i) => (i - 1 + OPTION_FIELDS.length) % OPTION_FIELDS.length)
        return
      }
      if (key.backspace || key.delete) {
        const field = OPTION_FIELDS[activeField]!
        setOpts((prev) => ({ ...prev, [field]: prev[field].slice(0, -1) }))
        return
      }
      if (input && !key.ctrl && !key.meta) {
        const field = OPTION_FIELDS[activeField]!
        setOpts((prev) => ({ ...prev, [field]: prev[field] + input }))
      }
      return
    }

    if (screen === 'result') {
      if (key.escape) {
        ranRef.current = false
        setHasRun(false)
        setRunStatus('')
        setProgress(null)
        setRawLog('')
        stdoutBufferRef.current = ''
        setScreen('options')
        return
      }
      if (key.return && runEnabled && !running && !ranRef.current) {
        void doRun()
      }
    }
  })

  const onOutcomeSelect = useCallback(
    (id: string) => {
      if (id === recipeId && screen === 'outcome') {
        setScreen('options')
        return
      }
      setRecipeId(id)
    },
    [recipeId, screen],
  )

  if (allRecipes.length === 0) {
    return <Text>No recipes available.</Text>
  }

  if (screen === 'outcome') {
    return (
      <OutcomeScreen outcomes={outcomeItems} selectedId={recipeId} onSelect={onOutcomeSelect} />
    )
  }

  if (screen === 'options') {
    const field = OPTION_FIELDS[activeField]!
    return (
      <Box flexDirection="column">
        <OptionsScreen
          filePath={opts.filePath}
          inPoint={opts.inPoint}
          outPoint={opts.outPoint}
          mode={opts.mode}
          rawArgs={opts.rawArgs}
          onChange={setOpts}
        />
        <Box marginTop={1}>
          <Text>Editing: {field} (Tab/Arrows move, Enter result, Esc back)</Text>
        </Box>
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <ResultScreen
        command={command}
        findings={findings}
        version={version}
        running={running}
        progress={progress}
        rawLog={rawLog}
      />
      <Box marginTop={1} flexDirection="column">
        {runEnabled && !hasRun && !running ? <Text>Press Enter to run. Esc to edit.</Text> : null}
        {runStatus ? <Text>{runStatus}</Text> : null}
        {!runEnabled ? <Text>Run disabled. Esc to edit.</Text> : null}
      </Box>
    </Box>
  )
}

export default App
