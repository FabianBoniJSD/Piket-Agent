import Link from 'next/link'
import { ArrowRight, Lock, ShieldCheck, Zap } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-[28px] border border-border bg-card/95 p-8 shadow-sm sm:p-12">
        <div className="eyebrow">Piket Agent</div>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
          Sichere Alarmierungs- und Einsatzsteuerung für deinen Piketbetrieb
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Plane Einsätze, verfolge Vorfälle und steuere Eskalationen in einer geschützten Oberfläche. Der Zugriff auf das Tool ist nur nach Login möglich.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link className={buttonVariants({ variant: 'accent', size: 'lg' })} href="/login">
            Zum Login
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link className={buttonVariants({ variant: 'secondary', size: 'lg' })} href="/dashboard">
            Zum Dashboard
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-muted/45 p-4">
            <Lock className="h-5 w-5 text-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">Geschützt per NextAuth</p>
            <p className="mt-1 text-sm text-muted-foreground">Authentifizierung vor Zugriff auf Kontakte, Vorfälle und Planung.</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/45 p-4">
            <ShieldCheck className="h-5 w-5 text-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">Klare Rollenbasis</p>
            <p className="mt-1 text-sm text-muted-foreground">Login-Daten werden serverseitig geprüft und als Session gespeichert.</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/45 p-4">
            <Zap className="h-5 w-5 text-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">Schneller Einstieg</p>
            <p className="mt-1 text-sm text-muted-foreground">Nach dem Login landest du direkt in der geschützten Arbeitsoberfläche.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
