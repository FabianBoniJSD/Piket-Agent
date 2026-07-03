'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock3, RefreshCw, ShieldAlert, Siren } from 'lucide-react'
import { MetricCard } from '@/components/metric-card'
import { PageHeader } from '@/components/page-header'
import { IncidentPriorityBadge, IncidentStatusBadge } from '@/components/status-badges'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime } from '@/lib/format'
import { getIncidents, type Incident } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      setIncidents(await getIncidents())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const total = incidents.length
  const alerting = incidents.filter((incident) => incident.status === 'alerting').length
  const accepted = incidents.filter((incident) => incident.status === 'accepted').length
  const critical = incidents.filter((incident) => incident.priority === 'critical').length
  const recent = [...incidents]
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    .slice(0, 8)
  const spotlight = recent.filter((incident) => incident.priority === 'critical' || incident.priority === 'high').slice(0, 3)
  const latestIncident = recent[0]
  const resolvedShare = total > 0 ? Math.round((accepted / total) * 100) : 0

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Dashboard"
        title="Übersicht über Piket, Alarmierung und laufende Vorfälle"
        description="Die Startseite bündelt die wichtigsten Kennzahlen und den aktuellen Incident-Status in einer reduzierten Übersicht."
        actions={
          <>
            <Button onClick={fetchData} variant="secondary">
              <RefreshCw className={cn(loading && 'animate-spin')} />
              Aktualisieren
            </Button>
            <Link className={buttonVariants({ variant: 'accent', size: 'lg' })} href="/incidents/new">
              <Siren />
              Neuen Piketfall eröffnen
            </Link>
          </>
        }
        meta={
          <>
            <div className="rounded-[20px] border border-border bg-card p-4">
              <div className="label-muted">Aktiv</div>
              <div className="mt-3 text-2xl font-semibold text-foreground">{loading ? 'Syncing...' : `${alerting} offen`}</div>
              <div className="mt-2 text-sm text-muted-foreground">Vorfälle mit laufender Alarmierung oder Bearbeitung.</div>
            </div>
            <div className="rounded-[20px] border border-border bg-card p-4">
              <div className="label-muted">Letzter Eintrag</div>
              <div className="mt-3 text-lg font-semibold text-foreground">{latestIncident ? latestIncident.title : 'Noch kein Vorfall'}</div>
              <div className="mt-2 text-sm text-muted-foreground">{latestIncident ? formatDateTime(latestIncident.created_at) : 'Neue Vorfälle erscheinen hier automatisch.'}</div>
            </div>
          </>
        }
      />

      {error ? (
        <Card className="border-danger/20 bg-danger/10">
          <CardContent className="flex items-center gap-3 px-6 py-5 text-danger">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          description="Alle erfassten Vorfälle im System."
          icon={ShieldAlert}
          label="Total incidents"
          tone="brand"
          value={loading ? '...' : total}
        />
        <MetricCard
          description="Eskalationen, die aktuell Kontakte anrufen."
          icon={Siren}
          label="Live alerting"
          tone="accent"
          value={loading ? '...' : alerting}
        />
        <MetricCard
          description="Bereits bestätigte und übernommene Vorfälle."
          icon={CheckCircle2}
          label="Accepted"
          tone="success"
          value={loading ? '...' : accepted}
        />
        <MetricCard
          description="Kritische Vorfälle mit höchster Eskalationsstufe."
          icon={AlertTriangle}
          label="Critical"
          tone="danger"
          value={loading ? '...' : critical}
        />
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border bg-card shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Dashboard-Statistiken</CardTitle>
            <CardDescription>Die wichtigsten Kennzahlen für die aktuelle Einsatzlage.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[18px] border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Bestätigt</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{loading ? '...' : accepted}</p>
              <p className="mt-1 text-sm text-muted-foreground">Übernommene Vorfälle</p>
            </div>
            <div className="rounded-[18px] border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Kritisch</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{loading ? '...' : critical}</p>
              <p className="mt-1 text-sm text-muted-foreground">Höchste Priorität im System</p>
            </div>
            <div className="rounded-[18px] border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Quote</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{loading ? '...' : `${resolvedShare}%`}</p>
              <p className="mt-1 text-sm text-muted-foreground">Anteil bestätigter Vorfälle</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted text-foreground">
                <Clock3 className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>Nächster Blick</CardTitle>
                <CardDescription>Kurzstatus für die operative Übersicht.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between rounded-[18px] border border-border bg-muted/50 px-4 py-3">
              <span>Aktive Alarmierungen</span>
              <span className="font-medium text-foreground">{loading ? '...' : alerting}</span>
            </div>
            <div className="flex items-center justify-between rounded-[18px] border border-border bg-muted/50 px-4 py-3">
              <span>Neueste Priorität</span>
              <span className="font-medium text-foreground">{latestIncident ? latestIncident.priority : '-'}</span>
            </div>
            <div className="flex items-center justify-between rounded-[18px] border border-border bg-muted/50 px-4 py-3">
              <span>Neuester Status</span>
              <span className="font-medium text-foreground">{latestIncident ? latestIncident.status : '-'}</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
        <Card>
          <CardHeader className="flex flex-row items-end justify-between gap-4">
            <div>
              <CardTitle>Incident stream</CardTitle>
              <CardDescription>Die letzten Vorfälle mit Priorität und aktuellem Bearbeitungsstatus.</CardDescription>
            </div>
            <Link className={buttonVariants({ variant: 'ghost', size: 'sm' })} href="/incidents">
              Alle Vorfälle öffnen
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="rounded-[20px] border border-border bg-muted/35 px-6 py-12 text-center text-sm text-muted-foreground">
                Vorfälle werden geladen...
              </div>
            ) : recent.length === 0 ? (
              <EmptyState
                action={
                  <Link className={buttonVariants({ variant: 'accent' })} href="/incidents/new">
                    Ersten Piketfall erstellen
                  </Link>
                }
                description="Sobald ein Vorfall erstellt wird, erscheint er hier mit Priorität, Status und Zeitstempel."
                icon={ShieldAlert}
                title="Noch keine Vorfälle vorhanden"
              />
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead>Titel</TableHead>
                    <TableHead>Priorität</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Erstellt</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {recent.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <Link className="block space-y-1" href={`/incidents/${incident.id}`}>
                          <div className="font-medium text-foreground transition hover:text-brand">{incident.title}</div>
                          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">#{incident.id}</div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <IncidentPriorityBadge priority={incident.priority} />
                      </TableCell>
                      <TableCell>
                        <IncidentStatusBadge status={incident.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDateTime(incident.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Ablauf</CardTitle>
              <CardDescription>Der Standardprozess für neue Piketfälle in kompakter Form.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                'Vorfall wird mit Priorität und Sprachnachricht erfasst.',
                'Das System alarmiert die aktuell zuständige Person über den Einsatzplan.',
                'Antwort, Eskalation und Status werden fortlaufend im Protokoll sichtbar.',
              ].map((step, index) => (
                <div className="flex gap-4" key={step}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-sm font-semibold text-foreground">
                    0{index + 1}
                  </div>
                  <div className="pt-2 text-sm leading-6 text-muted-foreground">{step}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted text-foreground">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Priorisierte Vorfälle</CardTitle>
                  <CardDescription>Die dringendsten Einträge aus dem aktuellen Verlauf.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {spotlight.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-border bg-muted/35 px-4 py-6 text-sm leading-6 text-muted-foreground">
                  Im Moment gibt es keine Vorfälle mit hoher oder kritischer Priorität.
                </div>
              ) : (
                spotlight.map((incident) => (
                  <Link
                    className="block rounded-[20px] border border-border bg-muted/35 p-4 transition hover:border-foreground/10 hover:bg-muted/55"
                    href={`/incidents/${incident.id}`}
                    key={incident.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium text-foreground">{incident.title}</div>
                        <div className="mt-2 text-sm text-muted-foreground">{formatDateTime(incident.created_at)}</div>
                      </div>
                      <IncidentPriorityBadge priority={incident.priority} />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <IncidentStatusBadge status={incident.status} />
                      <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">#{incident.id}</span>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
