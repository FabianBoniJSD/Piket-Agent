'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Megaphone, ShieldAlert, Siren, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { IncidentPriorityBadge } from '@/components/status-badges'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createIncident, type IncidentCreate, type IncidentPriority } from '@/lib/api'

export default function NewIncidentPage() {
  const router = useRouter()
  const [form, setForm] = useState<IncidentCreate>({
    title: '',
    description: '',
    priority: 'medium',
    voice_message: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('Titel ist erforderlich')
      return
    }

    if (!form.voice_message.trim()) {
      setError('Sprachnachricht ist erforderlich')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await createIncident(form)
      router.push('/incidents')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Erstellen')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Launch incident"
        title="Craft the alert payload before the first phone rings"
        description="Lege Titel, Eskalationsstufe und Sprachnachricht fest. Die Vorschau links zeigt sofort, wie der Vorfall in der neuen Leitstellen-Oberfläche erscheint."
        actions={
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft />
            Zurück
          </Button>
        }
        meta={
          <>
            <div className="glass-panel rounded-[24px] p-4">
              <div className="label-muted">Priority</div>
              <div className="mt-3">
                <IncidentPriorityBadge priority={(form.priority || 'medium') as IncidentPriority} />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">Bestimmt Tempo und Eskalationsschärfe.</div>
            </div>
            <div className="glass-panel rounded-[24px] p-4">
              <div className="label-muted">Voice preview</div>
              <div className="mt-3 text-lg font-semibold text-foreground">{form.title || 'Titelvorschau'}</div>
              <div className="mt-2 text-sm text-muted-foreground">{form.voice_message || 'Hier erscheint die Telefonansage in Kurzform.'}</div>
            </div>
          </>
        }
      />

      {error ? (
        <Card className="border-danger/20 bg-danger/10">
          <CardContent className="px-6 py-5 text-danger">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
        <div className="grid gap-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand/25 bg-brand/10 text-brand">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Voice payload preview</CardTitle>
                  <CardDescription>Die Operator-Sicht auf den neuen Vorfall unmittelbar nach dem Anlegen.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[20px] border border-border bg-muted/35 p-4">
                <div className="label-muted">Titel</div>
                <div className="mt-3 text-lg font-semibold text-foreground">{form.title || 'Neuer Piketfall'}</div>
              </div>
              <div className="rounded-[20px] border border-border bg-muted/35 p-4">
                <div className="label-muted">Beschreibung</div>
                <div className="mt-3 text-sm leading-7 text-muted-foreground">
                  {form.description || 'Optionaler Kontext für Team und Nachbearbeitung.'}
                </div>
              </div>
              <div className="rounded-[20px] border border-brand/20 bg-brand/10 p-5 font-mono text-sm leading-7 text-foreground">
                {form.voice_message || 'Die Telefonansage erscheint hier, sobald du sie eingibst.'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Dispatch checklist</CardTitle>
                  <CardDescription>Die drei Punkte, die vor dem Start wirklich sitzen sollten.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
              <div className="rounded-[20px] border border-border bg-muted/35 px-4 py-3">Wähle eine Priorität, die das Risiko realistisch abbildet.</div>
              <div className="rounded-[20px] border border-border bg-muted/35 px-4 py-3">Formuliere die Sprachnachricht kurz, eindeutig und mit klarer Handlungsaufforderung.</div>
              <div className="rounded-[20px] border border-border bg-muted/35 px-4 py-3">Nutze die Beschreibung für Kontext, der nicht gesprochen werden muss.</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Incident briefing</CardTitle>
            <CardDescription>Diese Angaben werden direkt für Alerting, Timeline und Detailansicht verwendet.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Titel *</label>
                <Input
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Kurze Beschreibung des Vorfalls"
                  required
                  value={form.title}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Beschreibung</label>
                <Textarea
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Zusätzlicher Kontext für das Team oder die Nachbearbeitung"
                  rows={5}
                  value={form.description || ''}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Priorität</label>
                <Select
                  onChange={(event) => setForm({ ...form, priority: event.target.value as IncidentPriority })}
                  value={form.priority}
                >
                  <option value="low">Low (Niedrig)</option>
                  <option value="medium">Medium (Mittel)</option>
                  <option value="high">High (Hoch)</option>
                  <option value="critical">Critical (Kritisch)</option>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Sprachnachricht *</label>
                <Textarea
                  onChange={(event) => setForm({ ...form, voice_message: event.target.value })}
                  placeholder="Text der telefonisch vorgelesen wird..."
                  required
                  rows={6}
                  value={form.voice_message}
                />
                <p className="text-sm leading-6 text-muted-foreground">Die Nachricht sollte sofort verständlich sein und mit wenigen Sätzen auskommen.</p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button disabled={saving} type="submit" variant="accent">
                  <Siren className="h-4 w-4" />
                  {saving ? 'Erstellt...' : 'Piketfall erstellen'}
                </Button>
                <Button onClick={() => router.back()} type="button" variant="secondary">
                  <ArrowLeft className="h-4 w-4" />
                  Abbrechen
                </Button>
                <div className="ml-auto flex items-center gap-2 rounded-full border border-border bg-muted/35 px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  Ready for dispatch
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
