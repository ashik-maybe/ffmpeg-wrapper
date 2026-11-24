import { useState } from 'react'
import { Button } from '../primitives/Button'
import { Segmented } from '../primitives/Segmented'
import type { Segment } from '../primitives/Segmented'
import './receipt.css'

export type CommandReceiptProps = {
  command: string
  confidence: string
  version: string
  sentences: readonly string[]
}

const FORM_SEGMENTS: readonly Segment[] = [
  { value: 'one-line', label: 'One line' },
  { value: 'multi-line', label: 'Multi line' },
]

export function CommandReceipt({ command, confidence, version, sentences }: CommandReceiptProps) {
  const [multiline, setMultiline] = useState(false)
  const [note, setNote] = useState('')

  const oneLine = command
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
  const shown = multiline ? command : oneLine

  const copy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(command)
        setNote('Copied')
        return
      }
    } catch {
      // The clipboard API can fail. Fall through to the textarea path.
    }
    const el = document.createElement('textarea')
    el.value = command
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(el)
    setNote(copied ? 'Copied' : 'Press Ctrl+C')
  }

  return (
    <section className="ui-receipt" aria-label="Command receipt">
      <p className="ui-receipt__sentences">{sentences.join(' ')}</p>
      <div className="ui-receipt__toolbar">
        <Segmented
          label="Command form"
          segments={FORM_SEGMENTS}
          value={multiline ? 'multi-line' : 'one-line'}
          onValueChange={(next) => setMultiline(next === 'multi-line')}
        />
        <Button onClick={copy} variant="quiet">
          Copy command
        </Button>
        {note && <output className="ui-receipt__note">{note}</output>}
      </div>
      <pre className="ui-receipt__code">
        <code>{shown}</code>
      </pre>
      <p className="ui-receipt__footer">
        <span className="ui-receipt__stamp">CHECKED {version}</span>
        <span className="ui-receipt__confidence">Confidence: {confidence}</span>
      </p>
    </section>
  )
}
