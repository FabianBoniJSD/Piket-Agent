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
        'hero-panel rounded-[24px] p-6 sm:p-8',
        className
      )}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {badge ? <Badge variant="outline">{badge}</Badge> : null}
          <h1 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-muted-foreground">{description}</p>
          {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {meta ? <div className="grid gap-3 sm:grid-cols-2 lg:w-[340px]">{meta}</div> : null}
      </div>
    </section>
  )
}