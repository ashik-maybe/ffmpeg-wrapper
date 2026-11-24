import type { LucideIcon } from 'lucide-react'
import { cn } from './cn'

export type IconProps = {
  icon: LucideIcon
  className?: string
  size?: number
  strokeWidth?: number
}

export function Icon({ icon: IconComponent, className, size = 18, strokeWidth = 1.5 }: IconProps) {
  return <IconComponent size={size} strokeWidth={strokeWidth} className={cn('icon', className)} />
}
