import * as Label from '@radix-ui/react-label'
import type { ReactNode } from 'react'
import { cn } from './cn'

export type FieldProps = {
  label: string
  hint?: string
  htmlFor?: string
  children: ReactNode
  className?: string
}

export function Field({ label, hint, htmlFor, children, className }: FieldProps) {
  return (
    <div className={cn('ui-field', className)}>
      <Label.Root className="ui-field__label" htmlFor={htmlFor}>
        {label}
      </Label.Root>
      {children}
      {hint ? <p className="ui-field__hint">{hint}</p> : null}
    </div>
  )
}
