'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  AlarmSmoke,
  CalendarRange,
  ClipboardList,
  LayoutDashboard,
  Settings2,
  UsersRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', hint: 'Live view', icon: LayoutDashboard },
  { href: '/contacts', label: 'Piketpersonen', hint: 'Crew', icon: UsersRound },
  { href: '/schedules', label: 'Piketplan', hint: 'Duty rota', icon: CalendarRange },
  { href: '/incidents/new', label: 'Piketfall', hint: 'Launch', icon: AlarmSmoke },
  { href: '/incidents', label: 'Vorfälle', hint: 'Logs', icon: ClipboardList },
  { href: '/settings', label: 'Einstellungen', hint: 'Config', icon: Settings2 },
]

type NavLinksProps = {
  orientation?: 'vertical' | 'horizontal'
}

export default function NavLinks({ orientation = 'vertical' }: NavLinksProps) {
  const pathname = usePathname()

  return (
    <ul
      className={cn(
        'scrollbar-hidden flex gap-2',
        orientation === 'vertical' ? 'flex-col' : 'overflow-x-auto pb-1'
      )}
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : item.href === '/incidents'
              ? pathname === '/incidents' || (pathname.startsWith('/incidents/') && pathname !== '/incidents/new')
              : pathname === item.href || pathname.startsWith(item.href + '/')

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-[24px] border px-4 py-3 transition duration-200',
                orientation === 'vertical'
                  ? 'min-h-[76px] justify-between'
                  : 'min-w-[170px] shrink-0 justify-start',
                isActive
                  ? 'border-brand/40 bg-brand/10 text-foreground shadow-brand'
                  : 'border-border bg-card/70 text-muted-foreground hover:border-brand/30 hover:bg-muted/60 hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-2xl border text-sm transition',
                    isActive
                      ? 'border-brand/40 bg-brand/20 text-brand'
                      : 'border-border bg-muted/55 text-muted-foreground group-hover:border-brand/30 group-hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium tracking-tight">{item.label}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">{item.hint}</div>
                </div>
              </div>
              {orientation === 'vertical' && (
                <div className="text-right text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80">
                  {isActive ? 'Open' : 'Jump'}
                </div>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
