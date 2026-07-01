import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
  {
    variants: {
      variant: {
        neutral: 'border-border bg-muted/70 text-muted-foreground',
        brand: 'border-brand/30 bg-brand/15 text-brand',
        success: 'border-success/25 bg-success/15 text-success',
        warning: 'border-warning/25 bg-warning/15 text-warning',
        danger: 'border-danger/25 bg-danger/15 text-danger',
        outline: 'border-border bg-transparent text-foreground',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }