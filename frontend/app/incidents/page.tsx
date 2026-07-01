'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ClipboardList, PlayCircle, RefreshCw, Siren, Sparkles } from 'lucide-react'
import { MetricCard } from '@/components/metric-card'
import { PageHeader } from '@/components/page-header'
import { IncidentPriorityBadge, IncidentStatusBadge } from '@/components/status-badges'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime } from '@/lib/format'
import { getIncidents, startAlert, type Incident } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function IncidentsPage() {
  const router = useRouter()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alertingId, setAlertingId] = useState<number | null>(null)

  const fetchIncidents = async () => {
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
    fetchIncidents()
  }, [])

  const handleStartAlert = async (event: React.MouseEvent, id: number) => {
    event.stopPropagation()
    setAlertingId(id)

    try {
      await startAlert(id)
      await fetchIncidents()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Starten der Alarmierung')
    } finally {
      setAlertingId(null)
    }
  }

  const sorted = [...incidents].sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
  const createdCount = incidents.filter((incident) => incident.status === 'created').length
  const alertingCount = incidents.filter((incident) => incident.status === 'alerting').length
  const acceptedCount = incidents.filter((incident) => incident.status === 'accepted').length

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Incident registry"
        title="Every alert, escalation and hand-off in one timeline"
        description="Inspect the full incident backlog, jump into live escalations and restart alerting for unresolved cases without leaving the control surface."
        actions={
          <>
            <Button onClick={fetchIncidents} variant="secondary">
              <RefreshCw className={cn(loading && 'animate-spin')} />
              Aktualisieren
            </Button>
            <Link className={buttonVariants({ variant: 'accent', size: 'lg' })} href="/incidents/new">
              <Siren />
              Neuer Vorfall
            </Link>
          </>
        }
        meta={
          <>
            <div className="glass-panel rounded-[24px] p-4">
              <div className="label-muted">Created</div>
              <div className="mt-3 text-2xl font-semibold text-foreground">{loading ? '...' : createdCount}</div>
              <div className="mt-2 text-sm text-muted-foreground">Warten auf den ersten Alarmversuch.</div>
            </div>
            <div className="glass-panel rounded-[24px] p-4">
              <div className="label-muted">Live alerting</div>
              <div className="mt-3 text-2xl font-semibold text-foreground">{loading ? '...' : alertingCount}</div>
              <div className="mt-2 text-sm text-muted-foreground">Fälle mit laufendem Anruf- und Eskalationsprozess.</div>
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          description="Alle derzeit im System verfolgten Vorfälle."
          icon={ClipboardList}
          label="Incidents"
          tone="brand"
          value={loading ? '...' : incidents.length}
        />
        <MetricCard
          description="Alarmierungen mit aktivem Kontaktversuch."
          icon={PlayCircle}
          label="Alerting"
          tone="accent"
          value={loading ? '...' : alertingCount}
        />
        <MetricCard
          description="Bereits übernommene oder akzeptierte Einsätze."
          icon={Sparkles}
          label="Accepted"
          tone="success"
          value={loading ? '...' : acceptedCount}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incident backlog</CardTitle>
          <CardDescription>Klick auf einen Eintrag, um in die Detailansicht mit Anrufprotokoll und Eskalationsstatus zu springen.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="rounded-[20px] border border-border bg-muted/35 px-6 py-12 text-center text-sm text-muted-foreground">
              Vorfälle werden geladen...
            </div>
          ) : sorted.length === 0 ? (
            <EmptyState
              action={
                <Link className={buttonVariants({ variant: 'accent' })} href="/incidents/new">
                  Ersten Vorfall anlegen
                </Link>
              }
              description="Erstelle einen Piketfall, um Alarmierung, Eskalation und Verlauf in der neuen Oberfläche sichtbar zu machen."
              icon={ClipboardList}
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
                  <TableHead className="text-right">Aktionen</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {sorted.map((incident) => {
                  const canRestart = incident.status === 'created' || incident.status === 'failed'

                  return (
                    <TableRow className="cursor-pointer" key={incident.id} onClick={() => router.push(`/incidents/${incident.id}`)}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{incident.title}</div>
                          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">#{incident.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <IncidentPriorityBadge priority={incident.priority} />
                      </TableCell>
                      <TableCell>
                        <IncidentStatusBadge status={incident.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDateTime(incident.created_at)}</TableCell>
                      <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                        {canRestart ? (
                          <Button onClick={(event) => handleStartAlert(event, incident.id)} size="sm" variant="accent">
                            <PlayCircle className={cn(alertingId === incident.id && 'animate-pulse')} />
                            {alertingId === incident.id ? 'Startet...' : 'Alarmierung starten'}
                          </Button>
                        ) : (
                          <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Keine Aktion</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
