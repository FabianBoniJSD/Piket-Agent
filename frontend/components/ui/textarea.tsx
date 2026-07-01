import * as React from 'react'
import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'min-h-[132px] w-full rounded-[20px] border border-input bg-card/75 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand/40 focus:bg-card focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
))

Textarea.displayName = 'Textarea'

export { Textarea }