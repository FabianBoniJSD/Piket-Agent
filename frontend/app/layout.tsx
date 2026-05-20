import type { Metadata } from 'next'
import './globals.css'
import NavLinks from './NavLinks'

export const metadata: Metadata = {
  title: 'Piket Alarmierungssystem',
  description: 'On-call alerting system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="font-sans">
        <div className="flex h-screen bg-gray-100">
          <aside className="w-64 bg-gray-900 text-white flex flex-col">
            <div className="p-6 border-b border-gray-700">
              <h1 className="text-xl font-bold text-white">🚨 Piket System</h1>
              <p className="text-gray-400 text-sm mt-1">Alarmierungssystem</p>
            </div>
            <nav className="flex-1 p-4">
              <NavLinks />
            </nav>
          </aside>
          <main className="flex-1 overflow-auto p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
