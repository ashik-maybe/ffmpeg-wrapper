import type { ReactNode } from 'react'
import { cn } from './cn'

export type KbdProps = {
  children: ReactNode
  className?: string
}

export function Kbd({ children, className }: KbdProps) {
  return <kbd className={cn('ui-kbd', className)}>{children}</kbd>
}
