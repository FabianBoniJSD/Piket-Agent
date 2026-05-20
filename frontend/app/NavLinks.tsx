'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/contacts', label: 'Piketpersonen', icon: '👥' },
  { href: '/schedules', label: 'Piketplan', icon: '📅' },
  { href: '/incidents/new', label: 'Piketfall', icon: '🚨' },
  { href: '/incidents', label: 'Vorfälle', icon: '📋' },
  { href: '/settings', label: 'Einstellungen', icon: '⚙️' },
]

export default function NavLinks() {
  const pathname = usePathname()
  return (
    <ul className="space-y-1">
      {navItems.map((item) => {
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
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
