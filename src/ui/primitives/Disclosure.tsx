import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from './cn'

export type DisclosureProps = {
  summary: string
  children: ReactNode
  className?: string
}

export function Disclosure({ summary, children, className }: DisclosureProps) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div className={cn('ui-disclosure', className)}>
      <button
        type="button"
        className="ui-disclosure__summary"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">{open ? '−' : '+'}</span>
        <span>{summary}</span>
      </button>
      <div id={id} hidden={!open} className="ui-disclosure__body">
        {children}
      </div>
    </div>
  )
}
