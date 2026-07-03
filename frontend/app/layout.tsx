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
      </body>
    </html>
  )
}
