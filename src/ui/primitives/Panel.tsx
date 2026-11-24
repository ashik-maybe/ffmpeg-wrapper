import type { ReactNode } from 'react'
import { cn } from './cn'

export type PanelProps = {
  children: ReactNode
  className?: string
  label?: string
}

export function Panel({ children, className, label }: PanelProps) {
  return (
    <section className={cn('ui-panel', className)} aria-label={label}>
      {children}
    </section>
  )
}
