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
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Übersicht' },
  { href: '/incidents/new', label: 'Piketfall', icon: AlarmSmoke, section: 'Übersicht' },
  { href: '/incidents', label: 'Vorfälle', icon: ClipboardList, section: 'Übersicht' },
  { href: '/contacts', label: 'Piketpersonen', icon: UsersRound, section: 'Organisation' },
  { href: '/schedules', label: 'Piketplan', icon: CalendarRange, section: 'Organisation' },
  { href: '/settings', label: 'Einstellungen', icon: Settings2, section: 'System' },
]

type NavLinksProps = {
  orientation?: 'vertical' | 'horizontal'
}

export default function NavLinks({ orientation = 'vertical' }: NavLinksProps) {
  const pathname = usePathname()

  const groupedItems = navItems.reduce<Record<string, typeof navItems>>((groups, item) => {
    const key = item.section
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {})

  const renderLink = (item: (typeof navItems)[number]) => {
    const Icon = item.icon
    const isActive =
      item.href === '/dashboard'
        ? pathname === '/dashboard'
        : item.href === '/incidents'
          ? pathname === '/incidents' || (pathname.startsWith('/incidents/') && pathname !== '/incidents/new')
          : pathname === item.href || pathname.startsWith(item.href + '/')

    return (
      <li key={item.href}>
        <Link
          href={item.href}
          className={cn(
            'group flex items-center gap-3 rounded-2xl border px-4 py-3 transition duration-200',
            orientation === 'vertical'
              ? 'min-h-[64px] justify-between'
              : 'min-w-[156px] shrink-0 justify-start',
            isActive
              ? 'border-foreground/10 bg-foreground text-background shadow-sm'
              : 'border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl border text-sm transition',
                isActive
                  ? 'border-background/15 bg-background/10 text-background'
                  : 'border-border bg-card text-muted-foreground group-hover:border-foreground/10 group-hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="font-medium tracking-tight">{item.label}</div>
          </div>
          {orientation === 'vertical' && isActive ? <span className="h-2 w-2 rounded-full bg-background/70" /> : null}
        </Link>
      </li>
    )
  }

  if (orientation === 'horizontal') {
    return (
      <ul className="scrollbar-hidden flex gap-2 overflow-x-auto pb-1">
        {navItems.map(renderLink)}
      </ul>
    )
  }

  return (
    <div className="space-y-5">
      {Object.entries(groupedItems).map(([section, items]) => (
        <div key={section}>
          <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{section}</div>
          <ul className="mt-2 flex flex-col gap-2">{items.map(renderLink)}</ul>
        </div>
      ))}
    </div>
  )
}
