import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'quiet'
  children: ReactNode
}

export function Button({ variant = 'secondary', className, children, ...rest }: ButtonProps) {
  return (
    <button className={cn('ui-button', `ui-button--${variant}`, className)} {...rest}>
      {children}
    </button>
  )
}
