'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark'

const storageKey = 'piket-theme'

function getPreferredTheme(): Theme {
  const storedTheme = window.localStorage.getItem(storageKey)

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const preferredTheme = getPreferredTheme()
    setTheme(preferredTheme)
    applyTheme(preferredTheme)
    setMounted(true)
  }, [])

  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  const label = mounted && theme === 'dark' ? 'Hell' : 'Dunkel'

  return (
    <Button
      aria-label={`Zum ${nextTheme === 'dark' ? 'dunklen' : 'hellen'} Modus wechseln`}
      className={cn('shrink-0 justify-between', className)}
      onClick={() => {
        setTheme(nextTheme)
        applyTheme(nextTheme)
        window.localStorage.setItem(storageKey, nextTheme)
      }}
      size="sm"
      variant="secondary"
    >
      {mounted && theme === 'dark' ? <Sun /> : <Moon />}
      <span>{label}</span>
    </Button>
  )
}