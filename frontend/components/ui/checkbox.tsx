import * as React from 'react'
import { cn } from '@/lib/utils'

const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type = 'checkbox', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'h-5 w-5 rounded-md border border-input bg-card text-brand outline-none ring-offset-background focus:ring-2 focus:ring-brand/20',
      className
    )}
    {...props}
  />
))

Checkbox.displayName = 'Checkbox'

export { Checkbox }