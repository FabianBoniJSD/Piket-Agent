'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, PhoneCall, Save, Settings2, ShieldCheck, TimerReset } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { getSettings, updateSettings, type AppSettings, type AppSettingsUpdate } from '@/lib/api'

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [form, setForm] = useState<AppSettingsUpdate>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getSettings()
      .then((value) => {
        setSettings(value)
        setForm({
          twilio_account_sid: value.twilio_account_sid || '',
          twilio_auth_token: value.twilio_auth_token || '',
          twilio_phone_number: value.twilio_phone_number || '',
          max_retries: value.max_retries,
          retry_delay_seconds: value.retry_delay_seconds,
          escalation_enabled: value.escalation_enabled,
        })
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Fehler beim Laden'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const updated = await updateSettings(form)
      setSettings(updated)
      setSuccess(true)
      window.setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">Einstellungen werden geladen...</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Configuration"
        title="Tune the escalation engine without leaving the command center"
        description="Pflege Twilio-Zugangsdaten, Wiederholungen und Eskalationslogik in einer Oberfläche, die technische Details lesbar statt sperrig macht."
        actions={
          <Button disabled={saving} form="settings-form" type="submit" variant="accent">
            <Save />
            {saving ? 'Speichert...' : 'Einstellungen speichern'}
          </Button>
        }
        meta={
          <>
            <div className="glass-panel rounded-[24px] p-4">
              <div className="label-muted">Retries</div>
              <div className="mt-3 text-2xl font-semibold text-foreground">{form.max_retries ?? settings?.max_retries ?? 0}</div>
              <div className="mt-2 text-sm text-muted-foreground">Maximale Wiederholungen pro Vorfall.</div>
            </div>
            <div className="glass-panel rounded-[24px] p-4">
              <div className="label-muted">Escalation</div>
              <div className="mt-3 text-lg font-semibold text-foreground">{form.escalation_enabled ?? settings?.escalation_enabled ? 'Aktiv' : 'Deaktiviert'}</div>
              <div className="mt-2 text-sm text-muted-foreground">Automatisches Weiterziehen zur nächsten Person.</div>
            </div>
          </>
        }
      />

      <Card className="border-warning/25 bg-warning/10">
        <CardContent className="flex flex-wrap items-start justify-between gap-4 px-6 py-5 text-warning">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5" />
            <div>
              <div className="font-medium">Hinweis für lokale Entwicklung</div>
              <div className="mt-1 text-sm text-warning">
                Twilio benötigt eine öffentliche URL für Webhooks. Verwende
                {' '}
                <a className="underline decoration-warning/70 underline-offset-4" href="https://ngrok.com" rel="noopener noreferrer" target="_blank">ngrok</a>
                {' '}
                oder einen ähnlichen Dienst, um deine lokale Instanz zu exponieren.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-danger/20 bg-danger/10">
          <CardContent className="px-6 py-5 text-danger">{error}</CardContent>
        </Card>
      ) : null}

      {success ? (
        <Card className="border-success/25 bg-success/10">
          <CardContent className="px-6 py-5 text-success">Einstellungen gespeichert.</CardContent>
        </Card>
      ) : null}

      <form className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]" id="settings-form" onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand/25 bg-brand/10 text-brand">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Twilio Konfiguration</CardTitle>
                  <CardDescription>Zugangsdaten und absendende Telefonnummer für Sprachalarmierung.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Account SID</label>
                <Input
                  className="font-mono text-sm"
                  onChange={(event) => setForm({ ...form, twilio_account_sid: event.target.value })}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={form.twilio_account_sid || ''}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Auth Token</label>
                <Input
                  className="font-mono text-sm"
                  onChange={(event) => setForm({ ...form, twilio_auth_token: event.target.value })}
                  placeholder="••••••••••••••••••••••••••••••••"
                  type="password"
                  value={form.twilio_auth_token || ''}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Telefonnummer</label>
                <Input
                  onChange={(event) => setForm({ ...form, twilio_phone_number: event.target.value })}
                  placeholder="+41xxxxxxxxx"
                  value={form.twilio_phone_number || ''}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
                  <Settings2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Alarmierungslogik</CardTitle>
                  <CardDescription>Steuere Retries, Verzögerungen und Eskalationsverhalten für den Live-Betrieb.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Maximale Wiederholungen</label>
                  <Input
                    max={10}
                    min={0}
                    onChange={(event) => setForm({ ...form, max_retries: Number.parseInt(event.target.value || '0', 10) })}
                    type="number"
                    value={form.max_retries ?? 3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Verzögerung zwischen Versuchen (Sekunden)</label>
                  <Input
                    min={10}
                    onChange={(event) => setForm({ ...form, retry_delay_seconds: Number.parseInt(event.target.value || '10', 10) })}
                    type="number"
                    value={form.retry_delay_seconds ?? 60}
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-[20px] border border-border bg-muted/35 px-4 py-3 text-sm text-foreground">
                <Checkbox
                  checked={form.escalation_enabled ?? true}
                  onChange={(event) => setForm({ ...form, escalation_enabled: event.target.checked })}
                />
                Eskalation aktivieren, wenn keine Antwort erfolgt
              </label>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-success/25 bg-success/10 text-success">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Runtime summary</CardTitle>
                <CardDescription>Die wichtigsten Steuergrössen der aktuellen Konfiguration auf einen Blick.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-[20px] border border-border bg-muted/35 px-4 py-4">
              <div className="label-muted">Retries</div>
              <div className="mt-2 text-2xl font-semibold text-foreground">{form.max_retries ?? settings?.max_retries ?? 0}</div>
            </div>
            <div className="rounded-[20px] border border-border bg-muted/35 px-4 py-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <TimerReset className="h-4 w-4" /> Delay
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">{form.retry_delay_seconds ?? settings?.retry_delay_seconds ?? 0}s</div>
            </div>
            <div className="rounded-[20px] border border-border bg-muted/35 px-4 py-4">
              <div className="label-muted">Escalation</div>
              <div className="mt-2 text-lg font-semibold text-foreground">{form.escalation_enabled ?? settings?.escalation_enabled ? 'Enabled' : 'Disabled'}</div>
              <div className="mt-2 text-sm text-muted-foreground">{settings?.twilio_phone_number ? `Outbound number ${settings.twilio_phone_number}` : 'Noch keine Absendernummer gesetzt.'}</div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
