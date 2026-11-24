import { useState } from 'react'
import type { DragEvent } from 'react'
import type { Shell } from '../../core/types'
import { content } from '../../content/index'
import { spec } from '../../spec/index'
import { Button } from '../primitives/Button'
import { Callout } from '../primitives/Callout'
import { Field } from '../primitives/Field'
import { Kbd } from '../primitives/Kbd'
import { Panel } from '../primitives/Panel'
import { Segmented } from '../primitives/Segmented'
import './handoff.css'

const installLines: Record<Shell, string> = {
  posix: `${content.install.macos} or ${content.install.linux}`,
  powershell: content.install.windowsPowerShell,
  cmd: content.install.windowsCmd,
}

export type HandoffPanelProps = {
  defaultShell?: Shell
}

export function HandoffPanel({ defaultShell = 'posix' }: HandoffPanelProps) {
  const [shell, setShell] = useState<Shell>(defaultShell)
  const [path, setPath] = useState('')
  const [version, setVersion] = useState('')

  const pastedVersion = version.trim()
  const versionWarning =
    pastedVersion && pastedVersion !== spec.version
      ? `The pasted version differs from the spec version ${spec.version}`
      : ''

  async function copyPath() {
    if (!path.trim()) return
    const clipboard = navigator.clipboard
    if (clipboard) await clipboard.writeText(path.trim())
  }

  function onDrop(event: DragEvent<HTMLInputElement>) {
    event.preventDefault()
    const text = event.dataTransfer.getData('text/plain')
    if (text) setPath(text)
  }

  return (
    <Panel label="Handoff">
      <Field label="Shell">
        <Segmented
          value={shell}
          onValueChange={(value) => setShell(value as Shell)}
          segments={[
            { value: 'posix', label: 'Posix' },
            { value: 'powershell', label: 'PowerShell' },
            { value: 'cmd', label: 'cmd' },
          ]}
          label="Shell"
        />
      </Field>

      <Field label="Install line">
        <p className="handoff__install">{installLines[shell]}</p>
      </Field>

      <Field label="Keystrokes">
        <p className="handoff__keystrokes">
          <Kbd>Ctrl+V</Kbd>
          <span> or </span>
          <Kbd>Cmd+V</Kbd>
          <span className="handoff__keystrokes-note"> {content.paste.paste}</span>
        </p>
      </Field>

      <Field label="File path" hint={content.filePathHelper.dragIntoTerminal}>
        <div className="handoff__path">
          <input
            className="handoff__path-input"
            value={path}
            onChange={(event) => setPath(event.target.value)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
            placeholder="Paste a file path"
          />
          <Button variant="quiet" onClick={copyPath} disabled={!path.trim()}>
            {content.filePathHelper.copyAsPath}
          </Button>
        </div>
      </Field>

      <Field
        label="Version check"
        hint={`Enter a version to check it against the spec version ${spec.version}`}
      >
        <input
          className="handoff__path-input"
          value={version}
          onChange={(event) => setVersion(event.target.value)}
          placeholder="Pasted version"
        />
        {versionWarning ? <Callout severity="warning">{versionWarning}</Callout> : null}
      </Field>
    </Panel>
  )
}
