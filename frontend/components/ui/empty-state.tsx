import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-border bg-muted/35">
      <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-brand/10 text-brand">
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
          <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  )
}