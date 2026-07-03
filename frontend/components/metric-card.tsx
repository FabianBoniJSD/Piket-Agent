import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const toneStyles = {
  brand: 'border-brand/25 bg-brand/10 text-brand',
  accent: 'border-accent/25 bg-accent/10 text-accent',
  success: 'border-success/25 bg-success/10 text-success',
  danger: 'border-danger/25 bg-danger/10 text-danger',
} as const

type MetricCardProps = {
  icon: LucideIcon
  label: string
  value: string | number
  description: string
  tone?: keyof typeof toneStyles
}

export function MetricCard({ icon: Icon, label, value, description, tone = 'brand' }: MetricCardProps) {
  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">{value}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl border', toneStyles[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}