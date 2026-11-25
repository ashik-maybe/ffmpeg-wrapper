import { stat } from 'node:fs/promises'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Text, useApp, useInput, useStdout } from 'ink'
import { OutcomeScreen, OptionsScreen, ResultScreen, MoreTasksScreen } from './screens/index.ts'
import type { OptionsValues, ResultFinding } from './screens/index.ts'
import { Chrome, HelpOverlay } from './components/index.ts'
import { recipes } from '../recipes/index.ts'
import { content } from '../content/index.ts'
import { CURATED_TASKS } from './tasks.ts'
import { render, validate } from '../core/index.ts'
import type { Plan, Recipe } from '../core/index.ts'
import { validateAgainstRuntime } from '../tools/index.ts'
import type { RuntimeSpec } from '../tools/index.ts'
import { runProcess } from '../runner/index.ts'
import type { RunResult } from '../runner/index.ts'
import { parseProgressLine } from '../progress/index.ts'
import { bindRecipeValues } from './binding.ts'

export type Screen = 'outcome' | 'options' | 'result' | 'more'

export interface AppProps {
  readonly recipes?: readonly Recipe[]
  readonly runEnabled?: boolean
  readonly yes?: boolean
  readonly force?: boolean
  readonly unsafe?: boolean
  readonly version?: string
  readonly spec?: RuntimeSpec
  readonly ffprobePath?: string
  readonly onRun?: (argv: readonly string[]) => Promise<RunResult>
  readonly onProbe?: (argv: readonly string[]) => Promise<RunResult>
  readonly outputExists?: (path: string) => Promise<boolean>
  readonly outputNonEmpty?: (path: string) => Promise<boolean>
  readonly columns?: number
}

const OPTION_FIELDS: readonly (keyof OptionsValues)[] = [
  'inputPath',
  'outputPath',
  'inPoint',
  'outPoint',
  'mode',
  'rawArgs',
]

const NETWORK_RECIPE_IDS = new Set(['hls', 'dash', 'rtmp', 'srt'])
const FILTER_SCRIPT_RECIPE_IDS = new Set(['filter-script'])
const HARDWARE_RECIPE_IDS = new Set(['nvenc', 'qsv', 'vaapi', 'videotoolbox', 'hevc-vulkan'])

function isNetworkRecipe(recipe: Recipe): boolean {
  return NETWORK_RECIPE_IDS.has(recipe.id)
}

function isFilterScriptRecipe(recipe: Recipe): boolean {
  return FILTER_SCRIPT_RECIPE_IDS.has(recipe.id)
}

function isHardwareRecipe(recipe: Recipe): boolean {
  return HARDWARE_RECIPE_IDS.has(recipe.id)
}

function unsafeBlockReason(recipe: Recipe, unsafe: boolean): string | undefined {
  if (isNetworkRecipe(recipe) && !unsafe) {
    return 'Network recipes require --unsafe'
  }
  if (isFilterScriptRecipe(recipe) && !unsafe) {
    return 'Filter-script recipes require --unsafe'
  }
  return undefined
}

function defaultOutput(filePath: string): string {
  if (filePath.trim() === '') return 'output.mp4'
  const dot = filePath.lastIndexOf('.')
  if (dot <= 0) return `${filePath}.out.mp4`
  return `${filePath.slice(0, dot)}.out${filePath.slice(dot)}`
}

function buildValues(opts: OptionsValues): Record<string, string> {
  const output = opts.outputPath.trim() !== '' ? opts.outputPath : defaultOutput(opts.inputPath)
  return {
    input: opts.inputPath,
    output,
    list: opts.inputPath,
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
  const bound = bindRecipeValues(recipe, values)
  const plan: Plan = { recipe: { ...recipe, args: bound.args }, args: bound.args }
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
  force = false,
  unsafe = false,
  version = 'unknown',
  spec,
  ffprobePath = 'tools/bin/ffprobe',
  onRun,
  onProbe,
  outputExists,
  outputNonEmpty,
  columns: columnsProp,
}: AppProps) {
  const { exit } = useApp()
  const { stdout } = useStdout()
  const detectedColumns = (stdout as { columns?: number } | undefined)?.columns
  const detected = typeof detectedColumns === 'number' ? detectedColumns : 80
  const columns = columnsProp ?? (detected > 0 ? detected : 80)
  const narrow = columns < 60
  const allRecipes = recipesProp ?? recipes
  const outcomeItems = useMemo(() => {
    if (recipesProp) {
      return allRecipes.map((r) => ({ id: r.id, label: r.id }))
    }
    const available = new Set(allRecipes.map((r) => r.id))
    const base = content.outcomes
      .filter((outcome) => outcome.recipeId && available.has(outcome.recipeId))
      .map((outcome) => ({
        id: outcome.recipeId as string,
        label: outcome.label,
        group: outcome.group,
      }))
    const seen = new Set(base.map((item) => item.id))
    const common = CURATED_TASKS.filter((task) => available.has(task.id)).map((task) => ({
      id: seen.has(task.id) ? `curated:${task.id}` : task.id,
      recipeId: task.id,
      label: task.label,
      group: 'Common tasks',
      hint: task.hint,
    }))
    return [...base, ...common]
  }, [allRecipes, recipesProp])
  const [screen, setScreen] = useState<Screen>('outcome')
  const [helpOpen, setHelpOpen] = useState(false)
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string>(
    outcomeItems[0]?.id ?? allRecipes[0]?.id ?? '',
  )
  const [activeField, setActiveField] = useState(0)
  const [advanced, setAdvanced] = useState(false)
  const [opts, setOpts] = useState<OptionsValues>({
    inputPath: '',
    outputPath: '',
    inPoint: '',
    outPoint: '',
    mode: 'copy',
    rawArgs: '',
  })
  const [runStatus, setRunStatus] = useState<string>('')
  const [running, setRunning] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [verification, setVerification] = useState('')
  const [progress, setProgress] = useState<{ time?: string; fps?: number; speed?: string } | null>(
    null,
  )
  const [rawLog, setRawLog] = useState('')
  const [confirmedRecipe, setConfirmedRecipe] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const ranRef = useRef(false)
  const stdoutBufferRef = useRef('')

  const recipeId = useMemo(() => {
    const item = outcomeItems.find((o) => o.id === selectedOutcomeId)
    const raw = (item as { recipeId?: string } | undefined)?.recipeId ?? selectedOutcomeId
    return raw.startsWith('curated:') ? raw.slice('curated:'.length) : raw
  }, [outcomeItems, selectedOutcomeId])

  const selectedRecipe = useMemo(
    () => allRecipes.find((r) => r.id === recipeId) ?? allRecipes[0],
    [allRecipes, recipeId],
  )

  const guardBlockReason = useMemo(
    () => (selectedRecipe ? unsafeBlockReason(selectedRecipe, unsafe) : undefined),
    [selectedRecipe, unsafe],
  )
  const hardwareUnverified = selectedRecipe ? isHardwareRecipe(selectedRecipe) : false
  const hardwareNeedsConfirm = hardwareUnverified && confirmedRecipe !== recipeId

  const { plan, argv, command } = useMemo(() => {
    if (!selectedRecipe) {
      return { plan: undefined, argv: [] as string[], command: '' }
    }
    return buildPlan(selectedRecipe, opts)
  }, [selectedRecipe, opts])

  const findings = useMemo(() => {
    if (!plan || !selectedRecipe) return [] as ResultFinding[]
    const values = buildValues(opts)
    const binding = bindRecipeValues(selectedRecipe, values)
    const core = validate(plan, { tool: selectedRecipe.tool, version: 'unknown', options: [] })
    const runtime = spec ? validateAgainstRuntime(spec, selectedRecipe) : []
    const seen = new Set<string>()
    const merged: ResultFinding[] = []
    for (const f of [...binding.findings, ...runtime, ...core]) {
      const key = `${f.code}:${f.message}`
      if (seen.has(key)) continue
      seen.add(key)
      merged.push({ severity: f.severity, message: f.message, code: f.code })
    }
    return merged
  }, [plan, selectedRecipe, spec, opts])

  const doRun = useCallback(async () => {
    if (running || ranRef.current) return

    if (guardBlockReason) {
      ranRef.current = true
      setHasRun(true)
      setRunStatus(`Blocked: ${guardBlockReason}`)
      return
    }

    if (hardwareNeedsConfirm) {
      ranRef.current = true
      setHasRun(true)
      setRunStatus('Blocked: unconfirmed hardware recipe')
      return
    }

    const blocked = findings.some((f) => f.severity === 'error' || f.code === 'UNBOUND_PLACEHOLDER')
    if (blocked) {
      ranRef.current = true
      setHasRun(true)
      setRunStatus('Blocked: resolve findings before execution')
      return
    }

    const outputPath = buildValues(opts).output
    const exists =
      outputExists ??
      (async (path: string) => {
        try {
          const s = await stat(path)
          return s.isFile()
        } catch {
          return false
        }
      })
    if (!force && (await exists(outputPath))) {
      ranRef.current = true
      setHasRun(true)
      setRunStatus(`Blocked: output file exists: ${outputPath}`)
      return
    }

    ranRef.current = true
    setHasRun(true)
    setRunning(true)
    setRunStatus('Running...')
    setVerification('')
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
        const probe = onProbe ?? ((args: readonly string[]) => runProcess([...args]))
        const probeResult = await probe([ffprobePath, '-hide_banner', outputPath])
        const nonEmpty = await (
          outputNonEmpty ??
          (async (path: string) => {
            try {
              const s = await stat(path)
              return s.isFile() && s.size > 0
            } catch {
              return false
            }
          })
        )(outputPath)
        if (probeResult.exitCode === 0 && nonEmpty) {
          setVerification('verified')
        } else {
          setVerification('failed')
        }
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
  }, [
    argv,
    ffprobePath,
    findings,
    force,
    guardBlockReason,
    hardwareNeedsConfirm,
    onProbe,
    onRun,
    opts,
    outputExists,
    outputNonEmpty,
    running,
  ])

  useEffect(() => {
    if (screen !== 'result' || !runEnabled || !yes || hardwareNeedsConfirm) return
    if (!ranRef.current) void doRun()
    const timers = [10, 30, 80].map((ms) =>
      setTimeout(() => {
        if (!ranRef.current) void doRun()
      }, ms),
    )
    return () => {
      for (const timer of timers) clearTimeout(timer)
    }
  }, [screen, runEnabled, yes, doRun, hardwareNeedsConfirm])

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      if (abortRef.current) {
        abortRef.current.abort()
      }
      exit()
      return
    }

    if (helpOpen) {
      if (input === '?' || key.escape) {
        setHelpOpen(false)
      }
      return
    }

    if (input === '?') {
      setHelpOpen(true)
      return
    }

    if (input === 'q' && screen !== 'options' && screen !== 'more') {
      exit()
      return
    }

    if (screen === 'outcome') {
      if (input === 'm') {
        setScreen('more')
        return
      }
      if (key.return) {
        // OutcomeScreen also handles Enter; we confirm here.
        if (selectedRecipe) setScreen('options')
      }
      return
    }

    if (screen === 'more') {
      return
    }

    if (screen === 'options') {
      const visibleFields = advanced ? OPTION_FIELDS : (['inputPath', 'outputPath'] as const)
      const active = visibleFields.includes(OPTION_FIELDS[activeField]!)
        ? OPTION_FIELDS[activeField]!
        : visibleFields[0]!
      const activeIndex = Math.max(0, visibleFields.indexOf(active))
      if (input === 'a' && !key.ctrl && !key.meta) {
        setAdvanced((v) => !v)
        if (!advanced) {
          // turning on: keep current active
        } else {
          // turning off: clamp to visible
          setActiveField(0)
        }
        return
      }
      if (key.escape) {
        setScreen('outcome')
        return
      }
      if (key.return) {
        setScreen('result')
        return
      }
      if (key.tab || key.downArrow) {
        const next = visibleFields[(activeIndex + 1) % visibleFields.length]!
        setActiveField(OPTION_FIELDS.indexOf(next))
        return
      }
      if (key.upArrow) {
        const next = visibleFields[(activeIndex - 1 + visibleFields.length) % visibleFields.length]!
        setActiveField(OPTION_FIELDS.indexOf(next))
        return
      }
      if (key.backspace || key.delete) {
        setOpts((prev) => ({ ...prev, [active]: prev[active].slice(0, -1) }))
        return
      }
      if (input && !key.ctrl && !key.meta) {
        setOpts((prev) => ({ ...prev, [active]: prev[active] + input }))
      }
      return
    }

    if (screen === 'result') {
      if (key.escape) {
        ranRef.current = false
        setHasRun(false)
        setRunStatus('')
        setVerification('')
        setProgress(null)
        setRawLog('')
        stdoutBufferRef.current = ''
        setScreen('options')
        return
      }
      if (key.return && runEnabled && !running && !ranRef.current) {
        if (hardwareNeedsConfirm) {
          setConfirmedRecipe(recipeId)
          ranRef.current = false
          setRunStatus('Hardware recipe confirmed. Press Enter to run')
          return
        }
        void doRun()
      }
    }
  })

  const onOutcomeSelect = useCallback(
    (id: string) => {
      if (id === '__more__') {
        setScreen('more')
        return
      }
      if (id === selectedOutcomeId && screen === 'outcome') {
        setScreen('options')
        return
      }
      setSelectedOutcomeId(id)
    },
    [selectedOutcomeId, screen],
  )

  if (allRecipes.length === 0) {
    return <Text>No recipes available.</Text>
  }

  const step = screen === 'outcome' ? 1 : screen === 'options' ? 2 : 3
  const stepLabel = screen === 'outcome' ? 'Outcomes' : screen === 'options' ? 'Options' : 'Result'
  const hints =
    screen === 'outcome'
      ? narrow
        ? [
            { keys: 'Up/Down', label: 'move' },
            { keys: 'Enter', label: 'select' },
            { keys: 'm', label: 'more' },
            { keys: '?', label: 'help' },
          ]
        : [
            { keys: 'Up/Down', label: 'move' },
            { keys: 'Enter', label: 'select' },
            { keys: 'm', label: 'more' },
            { keys: '?', label: 'help' },
            { keys: 'q', label: 'quit' },
          ]
      : screen === 'more'
        ? [
            { keys: 'Up/Down', label: 'move' },
            { keys: 'Enter', label: 'select' },
            { keys: 'Esc', label: 'back' },
            { keys: '?', label: 'help' },
          ]
        : screen === 'options'
          ? narrow
            ? [
                { keys: 'Tab', label: 'next' },
                { keys: 'a', label: 'advanced' },
                { keys: 'Enter', label: 'go' },
                { keys: 'Esc', label: 'back' },
              ]
            : [
                { keys: 'Tab/Arrows', label: 'move' },
                { keys: 'a', label: 'advanced' },
                { keys: 'Enter', label: 'result' },
                { keys: 'Esc', label: 'back' },
                { keys: '?', label: 'help' },
              ]
          : narrow
            ? [
                { keys: 'Enter', label: 'run' },
                { keys: 'Esc', label: 'back' },
                { keys: '?', label: 'help' },
                { keys: 'q', label: 'quit' },
              ]
            : [
                { keys: 'Enter', label: 'run' },
                { keys: 'Esc', label: 'edit' },
                { keys: '?', label: 'help' },
                { keys: 'q', label: 'quit' },
              ]

  const screenContent = helpOpen ? (
    <HelpOverlay />
  ) : screen === 'outcome' ? (
    <OutcomeScreen
      outcomes={outcomeItems}
      selectedId={selectedOutcomeId}
      onSelect={onOutcomeSelect}
      embedded
      onMore={() => setScreen('more')}
    />
  ) : screen === 'more' ? (
    <MoreTasksScreen
      embedded
      onBack={() => setScreen('outcome')}
      onSelect={(id) => {
        setSelectedOutcomeId(id)
        setScreen('options')
      }}
    />
  ) : screen === 'options' ? (
    <Box flexDirection="column">
      <OptionsScreen
        inputPath={opts.inputPath}
        outputPath={opts.outputPath}
        inPoint={opts.inPoint}
        outPoint={opts.outPoint}
        mode={opts.mode}
        rawArgs={opts.rawArgs}
        onChange={setOpts}
        onInputPathChange={(value) => setOpts((prev) => ({ ...prev, inputPath: value }))}
        onOutputPathChange={(value) => setOpts((prev) => ({ ...prev, outputPath: value }))}
        activeField={OPTION_FIELDS[activeField]}
        advanced={advanced}
        embedded
      />
    </Box>
  ) : (
    <Box flexDirection="column">
      <ResultScreen
        command={command}
        findings={findings}
        version={version}
        running={running}
        progress={progress}
        rawLog={rawLog}
        verification={verification === '' ? undefined : verification}
        blockedReason={
          guardBlockReason ?? (hardwareNeedsConfirm ? 'Unconfirmed hardware recipe' : undefined)
        }
        unverified={hardwareUnverified}
        embedded
        showRawLog={!narrow}
        taskLabel={
          CURATED_TASKS.find((t) => t.id === recipeId)?.label ??
          content.outcomes.find((o) => o.recipeId === recipeId)?.label ??
          recipeId
        }
      />
      <Box marginTop={1} flexDirection="column">
        {runEnabled && !hasRun && !running ? <Text>Press Enter to run. Esc to edit.</Text> : null}
        {runStatus ? <Text>{runStatus}</Text> : null}
        {!runEnabled ? <Text>Run disabled. Esc to edit.</Text> : null}
      </Box>
    </Box>
  )

  return (
    <Chrome version={version} step={step} total={3} right={stepLabel} hints={hints}>
      {screenContent}
    </Chrome>
  )
}

export default App
