import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties } from 'react'
import { buildHash, parseHash } from './core/router'
import { planFromRecipe } from './core/plan'
import { render } from './core/render'
import { validate } from './core/validate'
import type { CalibrationValues } from './ui/calibration/parse'
import type { Shell, ToolSpec } from './core/types'
import type { TrimRulerMode } from './ui/moment/TrimRuler'
import { content } from './content'
import filters from './spec/filters.json'
import optionsSpec from './spec/options.json'
import { recipes } from './recipes'
import { AdvancedDrawer } from './ui/advanced/AdvancedDrawer'
import { UserBuildCheck } from './ui/buildcheck'
import { FilterGraphEditor } from './ui/graph'
import { CalibrationPanel } from './ui/calibration/CalibrationPanel'
import { HandoffPanel } from './ui/handoff/HandoffPanel'
import { OutcomeGrid } from './ui/outcomes/OutcomeGrid'
import { Button } from './ui/primitives/Button'
import { Callout } from './ui/primitives/Callout'
import { Field } from './ui/primitives/Field'
import { Panel } from './ui/primitives/Panel'
import { Segmented } from './ui/primitives/Segmented'
import { CommandReceipt } from './ui/receipt/CommandReceipt'
import { TrimRuler } from './ui/moment/TrimRuler'

const CoveragePanel = lazy(() =>
  import('./ui/coverage').then((module) => ({ default: module.CoveragePanel })),
)

const spec = optionsSpec as unknown as ToolSpec & {
  readonly provenance: { readonly version: string }
}

const SHELLS: readonly Shell[] = ['posix', 'powershell', 'cmd']

const filterNames = (filters as readonly { name: string }[]).map((item) => item.name)

function isShell(value: string): value is Shell {
  return SHELLS.includes(value as Shell)
}

export default function App() {
  const initial = parseHash(window.location.hash)
  const [recipeId, setRecipeId] = useState(initial.params.recipeId ?? recipes[0]?.id ?? '')
  const [filePath, setFilePath] = useState(initial.params.file ?? '')
  const [inPoint, setInPoint] = useState(0)
  const [outPoint, setOutPoint] = useState(10)
  const [mode, setMode] = useState<TrimRulerMode>('trim')
  const [shell, setShell] = useState<Shell>('posix')
  const [rawArgs, setRawArgs] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [graphValue, setGraphValue] = useState('')
  const [showCoverage, setShowCoverage] = useState(() => !('IntersectionObserver' in window))
  const coverageRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (showCoverage) return
    const onFirstScroll = () => setShowCoverage(true)
    window.addEventListener('scroll', onFirstScroll, { once: true, passive: true })
    const node = coverageRef.current
    if (node === null || !('IntersectionObserver' in window)) {
      return () => window.removeEventListener('scroll', onFirstScroll)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShowCoverage(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(node)
    return () => {
      window.removeEventListener('scroll', onFirstScroll)
      observer.disconnect()
    }
  }, [showCoverage])

  useEffect(() => {
    history.replaceState(
      null,
      '',
      buildHash({ page: 'home', params: { recipeId, file: filePath } }),
    )
  }, [recipeId, filePath])

  useEffect(() => {
    const handlePopState = () => {
      const { params } = parseHash(window.location.hash)
      if (params.recipeId !== undefined) setRecipeId(params.recipeId)
      if (params.file !== undefined) setFilePath(params.file)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const recipe = recipes.find((item) => item.id === recipeId) ?? recipes[0]
  if (recipe === undefined) return <main className="app">{content.errorState}</main>

  const values: Record<string, string> = {
    input: filePath,
    output: 'out.mp4',
    start: inPoint.toFixed(3),
    duration: Math.max(0, outPoint - inPoint).toFixed(3),
  }

  const plan = planFromRecipe(recipe, values)
  let command = render({ tool: 'ffmpeg', args: plan.args }, shell)
  if (rawArgs.trim() !== '') command = `${command} ${rawArgs.trim()}`
  const findings = validate(plan, spec)

  const handleOutcome = (id: string) => {
    const outcome = content.outcomes.find((item) => item.id === id)
    const nextRecipeId = outcome?.recipeId ?? id
    const match = recipes.find((item) => item.id === nextRecipeId)
    if (match !== undefined) setRecipeId(match.id)
  }

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => setFilePath(event.target.value)

  const handleCalibration = (data: CalibrationValues) => {
    if (data.duration !== undefined) setOutPoint(Math.max(0.1, data.duration))
  }

  const heroStyle: CSSProperties = {
    minHeight: 'calc(100dvh - var(--space-16) * 2)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 'var(--space-6)',
  }

  const sectionStyle: CSSProperties = { minHeight: '100dvh' }

  return (
    <main id="main" className="app">
      <section className="hero" aria-label="Hero" style={heroStyle}>
        <h1 className="app-heading">{content.heroHeading}</h1>
        <p className="app-note hero-stamp">CHECKED {spec.provenance.version}</p>
      </section>

      <section className="app-section" style={sectionStyle}>
        <p className="app-note">{content.heroBody}</p>

        <Field label="File" hint={content.filePathHelper.dragIntoTerminal}>
          <input
            aria-label="File path"
            value={filePath}
            onChange={handleFile}
            placeholder="video.mp4"
          />
        </Field>
      </section>

      <section className="app-section" style={sectionStyle}>
        <Segmented
          label="Shell"
          value={shell}
          onValueChange={(value) => {
            if (isShell(value)) setShell(value)
          }}
          segments={SHELLS.map((item) => ({ value: item, label: item }))}
        />
      </section>

      <section className="app-section" style={sectionStyle}>
        <OutcomeGrid onSelect={handleOutcome} />
      </section>

      <section className="app-section" style={sectionStyle}>
        <TrimRuler
          inPoint={inPoint}
          outPoint={outPoint}
          onChange={(points) => {
            setInPoint(points.inPoint)
            setOutPoint(points.outPoint)
          }}
          min={0}
          max={Math.max(60, outPoint + 10)}
          mode={mode}
          onModeChange={setMode}
        />
      </section>

      <section className="app-section" style={sectionStyle}>
        <Panel label="Command">
          <CommandReceipt
            command={command}
            confidence={content.confidence.high}
            version={spec.provenance.version}
            sentences={[content.heroBody, content.coverage]}
          />
        </Panel>
      </section>

      {findings.length > 0 ? (
        <section className="app-section" style={sectionStyle}>
          <Panel label="Checks">
            <ul className="validation-findings">
              {findings.map((finding) => (
                <li key={finding.code}>
                  <Callout severity={finding.severity}>
                    {finding.code} — {finding.message}
                  </Callout>
                </li>
              ))}
            </ul>
          </Panel>
        </section>
      ) : null}

      <section className="app-section" style={sectionStyle}>
        <HandoffPanel value={shell} onValueChange={setShell} />
      </section>

      <section className="app-section" style={sectionStyle}>
        <CalibrationPanel onParsed={handleCalibration} />
      </section>

      <section className="app-section" style={sectionStyle}>
        <Panel label="Build check">
          <UserBuildCheck />
        </Panel>
      </section>

      <section className="app-section" style={sectionStyle}>
        <Panel label="Filter graph">
          <FilterGraphEditor
            value={graphValue}
            onChange={setGraphValue}
            filterNames={filterNames}
          />
        </Panel>
      </section>

      <section className="app-section" style={sectionStyle}>
        <AdvancedDrawer
          open={advancedOpen}
          onOpenChange={setAdvancedOpen}
          onSubmit={setRawArgs}
          trigger={<Button variant="quiet">Advanced</Button>}
        />
      </section>

      <section className="app-section" style={sectionStyle} ref={coverageRef}>
        <Panel label="Coverage">
          {showCoverage ? (
            <Suspense fallback={<p className="app-note">Loading coverage…</p>}>
              <CoveragePanel />
            </Suspense>
          ) : null}
        </Panel>
      </section>

      <p className="app-note">{content.emptyState}</p>
    </main>
  )
}
