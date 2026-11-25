import * as Label from '@radix-ui/react-label'
import { cloneElement, isValidElement, useId, type ReactNode } from 'react'
import { cn } from './cn'

export type FieldProps = {
  label: string
  hint?: string
  htmlFor?: string
  children: ReactNode
  className?: string
}

type ControlProps = { id?: string }

export function Field({ label, hint, htmlFor, children, className }: FieldProps) {
  const generatedId = useId()
  const controlId = htmlFor ?? generatedId
  const control = isValidElement<ControlProps>(children)
    ? cloneElement(children, { id: children.props.id ?? controlId })
    : children
  return (
    <div className={cn('ui-field', className)}>
      <Label.Root className="ui-field__label" htmlFor={controlId}>
        {label}
      </Label.Root>
      {control}
      {hint ? <p className="ui-field__hint">{hint}</p> : null}
    </div>
  )
}
