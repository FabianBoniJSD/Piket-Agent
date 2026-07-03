import type { Metadata } from 'next'
import { IBM_Plex_Mono, Manrope, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { AppShell } from './AppShell'

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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
