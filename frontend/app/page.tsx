'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, RefreshCw, ShieldAlert, Siren, Waves } from 'lucide-react'
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

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Realtime escalation"
        title="Operate your on-call response with more signal, less friction"
        description="Monitor live incidents, trigger escalation calls and keep the entire duty roster synchronized from one responsive control surface."
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
            <div className="glass-panel rounded-[24px] p-4">
              <div className="label-muted">Operations pulse</div>
              <div className="mt-3 text-2xl font-semibold text-foreground">{loading ? 'Syncing...' : `${alerting} live`}</div>
              <div className="mt-2 text-sm text-muted-foreground">Aktive Alarmierungen mit laufenden Kontaktversuchen.</div>
            </div>
            <div className="glass-panel rounded-[24px] p-4">
              <div className="label-muted">Latest incident</div>
              <div className="mt-3 text-lg font-semibold text-foreground">{latestIncident ? latestIncident.title : 'Noch kein Vorfall'}</div>
              <div className="mt-2 text-sm text-muted-foreground">{latestIncident ? formatDateTime(latestIncident.created_at) : 'Sobald ein Vorfall erstellt wird, erscheint er hier.'}</div>
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
              <CardTitle>Escalation cadence</CardTitle>
              <CardDescription>Ein kompakter Blick auf den Ablauf, wie das System auf einen Vorfall reagiert.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                'Vorfall wird mit Priorität und Sprachnachricht erfasst.',
                'Das System alarmiert die aktuell zuständige Person über den Einsatzplan.',
                'Antwort, Eskalation und Status werden fortlaufend im Protokoll sichtbar.',
              ].map((step, index) => (
                <div className="flex gap-4" key={step}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-brand/25 bg-brand/10 text-sm font-semibold text-brand">
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
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
                  <Waves className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Priority spotlight</CardTitle>
                  <CardDescription>Die dringendsten Vorfälle aus dem aktuellen Stream.</CardDescription>
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
                    className="block rounded-[20px] border border-border bg-muted/35 p-4 transition hover:border-brand/30 hover:bg-muted/55"
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
