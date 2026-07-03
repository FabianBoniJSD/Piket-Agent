'use client'

import { usePathname } from 'next/navigation'
import NavLinks from './NavLinks'
import { ThemeToggle } from '@/components/theme-toggle'

const publicPaths = ['/', '/login']

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublicPage = publicPaths.includes(pathname)

  if (isPublicPage) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="hidden w-[304px] shrink-0 border-r border-border bg-[hsl(var(--shell)/0.94)] lg:block">
          <div className="sticky top-0 flex h-screen flex-col px-6 py-8">
            <div>
              <div className="eyebrow">Piket Agent</div>
              <h1 className="mt-4 text-2xl font-semibold text-foreground">Menü</h1>
            </div>

            <div className="mt-6 flex-1 rounded-[28px] border border-border bg-card p-4 shadow-sm">
              <nav>
                <NavLinks orientation="vertical" />
              </nav>
            </div>

            <div className="mt-6">
              <ThemeToggle className="w-full" />
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-border bg-[hsl(var(--shell)/0.96)] lg:hidden">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="eyebrow">Piket Agent</div>
                  <div className="mt-2 text-lg font-semibold text-foreground">Control Center</div>
                </div>
                <ThemeToggle />
              </div>
              <NavLinks orientation="horizontal" />
            </div>
          </header>

          <main className="flex flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
            <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
