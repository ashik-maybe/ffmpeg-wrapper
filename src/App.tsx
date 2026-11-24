import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { buildHash, parseHash } from './core/router'
import { planFromRecipe } from './core/plan'
import { render } from './core/render'
import { validate } from './core/validate'
import type { CalibrationValues } from './ui/calibration/parse'
import type { Shell } from './core/types'
import type { TrimRulerMode } from './ui/moment/TrimRuler'
import { content } from './content'
import { recipes } from './recipes'
import { spec } from './spec'
import { AdvancedDrawer } from './ui/advanced/AdvancedDrawer'
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

const SHELLS: readonly Shell[] = ['posix', 'powershell', 'cmd']

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

  useEffect(() => {
    window.location.hash = buildHash({
      page: 'home',
      params: { recipeId, file: filePath },
    })
  }, [recipeId, filePath])

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
    const match = recipes.find((item) => item.id.includes(id) || id.includes(item.id))
    if (match !== undefined) setRecipeId(match.id)
  }

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => setFilePath(event.target.value)

  const handleCalibration = (data: CalibrationValues) => {
    if (data.duration !== undefined) setOutPoint(Math.max(0.1, data.duration))
  }

  return (
    <main className="app">
      <h1 className="app-heading">{content.heroHeading}</h1>
      <p className="app-note">{content.heroBody}</p>

      <Field label="File" hint={content.filePathHelper.dragIntoTerminal}>
        <input
          aria-label="File path"
          value={filePath}
          onChange={handleFile}
          placeholder="video.mp4"
        />
      </Field>

      <Segmented
        label="Shell"
        value={shell}
        onValueChange={(value) => {
          if (isShell(value)) setShell(value)
        }}
        segments={SHELLS.map((item) => ({ value: item, label: item }))}
      />

      <OutcomeGrid onSelect={handleOutcome} />

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

      <Panel label="Command">
        <CommandReceipt
          command={command}
          confidence={content.confidence.high}
          version={spec.provenance.version}
          sentences={[content.heroBody, content.coverage]}
        />
      </Panel>

      {findings.length > 0 ? (
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
      ) : null}

      <HandoffPanel defaultShell={shell} />
      <CalibrationPanel onParsed={handleCalibration} />

      <Button variant="quiet" onClick={() => setAdvancedOpen(true)}>
        Advanced
      </Button>
      <AdvancedDrawer open={advancedOpen} onOpenChange={setAdvancedOpen} onSubmit={setRawArgs} />

      <Panel label="Coverage">{content.coverage}</Panel>
      <p className="app-note">{content.emptyState}</p>
    </main>
  )
}
