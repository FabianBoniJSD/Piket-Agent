import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type PageHeaderProps = {
  badge?: string
  title: string
  description: string
  actions?: React.ReactNode
  meta?: React.ReactNode
  className?: string
}

export function PageHeader({ badge, title, description, actions, meta, className }: PageHeaderProps) {
  return (
    <section
      className={cn(
        'hero-panel relative overflow-hidden rounded-[28px] p-6 sm:p-8',
        className
      )}
    >
      <div className="absolute -left-20 top-8 h-40 w-40 rounded-full bg-brand/15 blur-3xl" />
      <div className="absolute right-0 top-0 h-56 w-56 animate-float rounded-full bg-accent/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {badge ? <Badge variant="outline">{badge}</Badge> : null}
          <h1 className="mt-4 text-4xl font-semibold text-foreground sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>
          {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {meta ? <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">{meta}</div> : null}
      </div>
    </section>
  )
}