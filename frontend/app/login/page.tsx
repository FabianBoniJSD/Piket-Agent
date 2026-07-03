'use client'

import { FormEvent, useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const [callbackUrl, setCallbackUrl] = useState('/dashboard')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const nextUrl = params.get('callbackUrl')
    if (nextUrl) {
      setCallbackUrl(nextUrl)
    }
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
      callbackUrl,
    })

    setLoading(false)

    if (!result || result.error) {
      setError('Ungültige Zugangsdaten')
      return
    }

    router.push(result.url || callbackUrl)
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-12 sm:px-6">
      <Card className="w-full rounded-[24px] border-border bg-card shadow-sm">
        <CardHeader>
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <CardTitle>Login</CardTitle>
          <CardDescription>Melde dich an, um auf das Piket-Tool zuzugreifen.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Benutzername</label>
              <Input
                autoComplete="username"
                onChange={(event) => setUsername(event.target.value)}
                required
                value={username}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Passwort</label>
              <Input
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </div>
            {error ? <div className="rounded-xl border border-danger/25 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div> : null}
            <Button className="w-full" disabled={loading} type="submit" variant="accent">
              {loading ? 'Anmeldung läuft...' : 'Anmelden'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
