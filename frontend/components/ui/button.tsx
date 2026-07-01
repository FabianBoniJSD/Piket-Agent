import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full border border-transparent font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-brand text-brand-foreground shadow-brand hover:-translate-y-0.5 hover:brightness-110',
        secondary: 'border-border bg-card/85 text-foreground hover:bg-muted',
        outline: 'border-border bg-transparent text-foreground hover:bg-muted',
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        accent: 'bg-accent text-accent-foreground shadow-accent hover:-translate-y-0.5 hover:brightness-105',
        danger: 'border-danger/25 bg-danger/10 text-danger hover:bg-danger/20',
      },
      size: {
        default: 'h-11 px-5 text-sm',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-6 text-sm',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} type={type} {...props} />
  }
)

Button.displayName = 'Button'

export { Button }