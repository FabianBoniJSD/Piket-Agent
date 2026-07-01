import type { Metadata } from 'next'
import { IBM_Plex_Mono, Manrope, Space_Grotesk } from 'next/font/google'
import './globals.css'
import NavLinks from './NavLinks'
import { ThemeToggle } from '@/components/theme-toggle'

const sans = Manrope({ subsets: ['latin'], variable: '--font-sans' })
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Piket Control Center',
  description: 'Command center for on-call escalation, contacts, schedules, and Twilio alerting.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const stored = window.localStorage.getItem('piket-theme'); const theme = stored === 'light' || stored === 'dark' ? stored : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.classList.toggle('dark', theme === 'dark'); document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme; } catch (_) {} })();`,
          }}
        />
      </head>
      <body className={`${sans.variable} ${display.variable} ${mono.variable} font-sans`}>
        <div className="relative min-h-screen overflow-hidden">
          <div className="relative flex min-h-screen flex-col lg:flex-row">
            <aside className="hidden w-[304px] shrink-0 border-r border-border bg-[hsl(var(--shell)/0.82)] backdrop-blur-xl lg:block">
              <div className="sticky top-0 flex h-screen flex-col px-5 py-6">
                <div className="glass-panel overflow-hidden rounded-[26px] p-5">
                  <div className="eyebrow">Piket Command</div>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-semibold text-foreground">Control Center</h1>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Alerting, escalation and duty planning in one operating surface.
                      </p>
                    </div>
                    <div className="relative mt-1 h-11 w-11 rounded-2xl border border-border bg-brand/15 text-brand shadow-brand">
                      <div className="absolute inset-0 animate-pulse-soft rounded-2xl bg-brand/20" />
                      <div className="relative flex h-full items-center justify-center font-display text-lg font-semibold">PC</div>
                    </div>
                  </div>
                  <ThemeToggle className="mt-5 w-full" />
                </div>

                <div className="label-muted mt-6">
                  Navigation
                </div>
                <nav className="mt-3 flex-1">
                  <NavLinks orientation="vertical" />
                </nav>

                <div className="glass-panel rounded-[24px] p-5">
                  <p className="label-muted">System Focus</p>
                  <p className="mt-3 text-base font-semibold text-foreground">Realtime response for critical incidents</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Use the dashboard to triage incidents fast, then keep contacts, schedules and Twilio settings synchronized.
                  </p>
                </div>
              </div>
            </aside>

            <div className="flex min-h-screen flex-1 flex-col">
              <header className="border-b border-border bg-[hsl(var(--shell)/0.9)] backdrop-blur-xl lg:hidden">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="eyebrow">Piket Command</div>
                      <div className="mt-2 text-lg font-semibold text-foreground">Control Center</div>
                    </div>
                    <ThemeToggle />
                  </div>
                  <NavLinks orientation="horizontal" />
                </div>
              </header>

              <main className="mx-auto flex w-full max-w-[1420px] flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
                {children}
              </main>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
