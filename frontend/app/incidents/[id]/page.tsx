'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertTriangle, ArrowLeft, CheckCircle2, PhoneCall, RefreshCw, Siren, Waves } from 'lucide-react'
import { MetricCard } from '@/components/metric-card'
import { PageHeader } from '@/components/page-header'
import { CallStatusBadge, IncidentPriorityBadge, IncidentStatusBadge } from '@/components/status-badges'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime } from '@/lib/format'
import { getIncident, getIncidentCallLogs, startAlert, type CallLog, type Incident } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function IncidentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)
  const [incident, setIncident] = useState<Incident | null>(null)
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alerting, setAlerting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [incidentData, callLogData] = await Promise.all([getIncident(id), getIncidentCallLogs(id)])
      setIncident(incidentData)
      setCallLogs(callLogData)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (incident?.status !== 'alerting') return

    const intervalId = window.setInterval(fetchData, 5000)
    return () => window.clearInterval(intervalId)
  }, [incident?.status, fetchData])

  const handleStartAlert = async () => {
    setAlerting(true)

    try {
      await startAlert(id)
      await fetchData()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Starten der Alarmierung')
    } finally {
      setAlerting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">Vorfall und Protokolle werden geladen...</CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-danger/20 bg-danger/10">
        <CardContent className="flex items-center gap-3 px-6 py-5 text-danger">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </CardContent>
      </Card>
    )
  }

  if (!incident) {
    return <EmptyState description="Der angeforderte Vorfall konnte nicht geladen werden." icon={AlertTriangle} title="Vorfall nicht gefunden" />
  }

  const completedCalls = callLogs.filter((log) => log.status === 'completed').length
  const activeCalls = callLogs.filter((log) => ['queued', 'ringing', 'in-progress', 'initiated'].includes(log.status)).length
  const failedCalls = callLogs.filter((log) => ['failed', 'no-answer', 'busy'].includes(log.status)).length
  const canRestart = incident.status === 'created' || incident.status === 'failed'

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Incident detail"
        title={incident.title}
        description={incident.description || 'Für diesen Vorfall wurde keine zusätzliche schriftliche Beschreibung hinterlegt.'}
        actions={
          <>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft />
              Zurück
            </Button>
            <Button onClick={fetchData} variant="secondary">
              <RefreshCw className={cn(incident.status === 'alerting' && 'animate-spin')} />
              Neu laden
            </Button>
            {canRestart ? (
              <Button onClick={handleStartAlert} variant="accent">
                <Siren className={cn(alerting && 'animate-pulse')} />
                {alerting ? 'Startet...' : 'Alarmierung starten'}
              </Button>
            ) : null}
          </>
        }
        meta={
          <>
            <div className="glass-panel rounded-[24px] p-4">
              <div className="label-muted">Status</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <IncidentPriorityBadge priority={incident.priority} />
                <IncidentStatusBadge status={incident.status} />
              </div>
            </div>
            <div className="glass-panel rounded-[24px] p-4">
              <div className="label-muted">Opened</div>
              <div className="mt-3 text-lg font-semibold text-foreground">{formatDateTime(incident.created_at)}</div>
              <div className="mt-2 text-sm text-muted-foreground">Zuletzt aktualisiert {formatDateTime(incident.updated_at)}</div>
            </div>
          </>
        }
      />

      {incident.status === 'alerting' ? (
        <Card className="border-brand/20 bg-brand/10">
          <CardContent className="flex items-center gap-3 px-6 py-5 text-brand">
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand" />
            <span>Alarmierung läuft. Die Ansicht aktualisiert sich alle 5 Sekunden automatisch.</span>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          description="Alle protokollierten Kontaktversuche für diesen Vorfall."
          icon={PhoneCall}
          label="Call attempts"
          tone="brand"
          value={callLogs.length}
        />
        <MetricCard
          description="Abgeschlossene und erfolgreich beendete Verbindungen."
          icon={CheckCircle2}
          label="Completed"
          tone="success"
          value={completedCalls}
        />
        <MetricCard
          description="Aktive oder fehlgeschlagene Versuche im Eskalationslauf."
          icon={AlertTriangle}
          label="Open + failed"
          tone="accent"
          value={activeCalls + failedCalls}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Incident facts</CardTitle>
            <CardDescription>Die wichtigsten Steuerdaten für die Alarmierung und Dokumentation.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-between gap-4 rounded-[20px] border border-border bg-muted/35 px-4 py-3">
                <dt className="text-muted-foreground">ID</dt>
                <dd className="font-medium text-foreground">#{incident.id}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-[20px] border border-border bg-muted/35 px-4 py-3">
                <dt className="text-muted-foreground">Priorität</dt>
                <dd><IncidentPriorityBadge priority={incident.priority} /></dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-[20px] border border-border bg-muted/35 px-4 py-3">
                <dt className="text-muted-foreground">Status</dt>
                <dd><IncidentStatusBadge status={incident.status} /></dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-[20px] border border-border bg-muted/35 px-4 py-3">
                <dt className="text-muted-foreground">Erstellt</dt>
                <dd>{formatDateTime(incident.created_at)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-[20px] border border-border bg-muted/35 px-4 py-3">
                <dt className="text-muted-foreground">Aktualisiert</dt>
                <dd>{formatDateTime(incident.updated_at)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-[20px] border border-border bg-muted/35 px-4 py-3">
                <dt className="text-muted-foreground">Accepted by</dt>
                <dd>{incident.accepted_by_contact_id ? `#${incident.accepted_by_contact_id}` : 'Noch nicht bestätigt'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand/25 bg-brand/10 text-brand">
                <Waves className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Voice payload</CardTitle>
                <CardDescription>Der Text, der dem on-call Kontakt telefonisch vorgelesen wird.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {incident.description ? (
              <div className="rounded-[20px] border border-border bg-muted/35 p-4">
                <div className="label-muted">Beschreibung</div>
                <p className="mt-3 text-sm leading-7 text-foreground">{incident.description}</p>
              </div>
            ) : null}
            <div className="rounded-[20px] border border-brand/20 bg-brand/10 p-5 font-mono text-sm leading-7 text-foreground">
              {incident.voice_message}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-end justify-between gap-4">
          <div>
            <CardTitle>Call log</CardTitle>
            <CardDescription>Alle Kontaktversuche, Statuswechsel und Antworten für diesen Vorfall.</CardDescription>
          </div>
          <Button onClick={fetchData} size="sm" variant="ghost">
            <RefreshCw className="h-4 w-4" />
            Aktualisieren
          </Button>
        </CardHeader>
        <CardContent>
          {callLogs.length === 0 ? (
            <EmptyState
              description="Sobald ein Kontaktversuch gestartet wird, erscheinen hier Twilio-SID, Antwort und Zeitstempel."
              icon={PhoneCall}
              title="Noch keine Anrufprotokolle"
            />
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Twilio SID</TableHead>
                  <TableHead>Antwort</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Ende</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {callLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{log.contact?.name ?? `#${log.contact_id}`}</div>
                    </TableCell>
                    <TableCell>
                      <CallStatusBadge status={log.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.twilio_call_sid || '—'}</TableCell>
                    <TableCell>{log.response_digit || '—'}</TableCell>
                    <TableCell>{formatDateTime(log.started_at)}</TableCell>
                    <TableCell>{log.ended_at ? formatDateTime(log.ended_at) : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
