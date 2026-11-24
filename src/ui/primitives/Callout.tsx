import type { ReactNode } from 'react'
import { cn } from './cn'

export type CalloutProps = {
  severity: 'error' | 'warning' | 'info'
  children: ReactNode
  className?: string
}

export function Callout({ severity, children, className }: CalloutProps) {
  return (
    <output className={cn('ui-callout', `ui-callout--${severity}`, className)}>{children}</output>
  )
}
