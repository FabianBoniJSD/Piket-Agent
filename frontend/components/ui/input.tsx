import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-12 w-full rounded-2xl border border-input bg-card/75 px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand/40 focus:bg-card focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
))

Input.displayName = 'Input'

export { Input }