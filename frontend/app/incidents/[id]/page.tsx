'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getIncident, getIncidentCallLogs, startAlert, Incident, CallLog } from '@/lib/api'

const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

const statusColors: Record<string, string> = {
  created: 'bg-gray-100 text-gray-800',
  alerting: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

const callStatusColors: Record<string, string> = {
  queued: 'bg-gray-100 text-gray-800',
  ringing: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  'no-answer': 'bg-orange-100 text-orange-800',
  busy: 'bg-orange-100 text-orange-800',
}

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
      const [inc, logs] = await Promise.all([getIncident(id), getIncidentCallLogs(id)])
      setIncident(inc)
      setCallLogs(logs)
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
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
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

  if (loading) return <div className="p-8 text-center text-gray-500">Laden...</div>
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>
  if (!incident) return <div className="p-8 text-center text-gray-500">Vorfall nicht gefunden</div>

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">← Zurück</button>
        <h1 className="text-3xl font-bold text-gray-900 flex-1">{incident.title}</h1>
        {(incident.status === 'created' || incident.status === 'failed') && (
          <button onClick={handleStartAlert} disabled={alerting}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg font-medium transition-colors">
            {alerting ? 'Starten...' : '🚨 Alarmierung starten'}
          </button>
        )}
      </div>

      {incident.status === 'alerting' && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg flex items-center gap-2">
          <span className="animate-pulse">●</span>
          <span>Alarmierung läuft – wird alle 5 Sekunden aktualisiert</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">ID</dt>
              <dd className="font-medium">#{incident.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Priorität</dt>
              <dd><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${priorityColors[incident.priority]}`}>{incident.priority}</span></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Status</dt>
              <dd><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[incident.status]}`}>{incident.status}</span></dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Erstellt</dt>
              <dd>{new Date(incident.created_at).toLocaleString('de-CH')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Aktualisiert</dt>
              <dd>{new Date(incident.updated_at).toLocaleString('de-CH')}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nachrichten</h2>
          {incident.description && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Beschreibung</p>
              <p className="text-gray-900">{incident.description}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500 mb-1">Sprachnachricht</p>
            <p className="text-gray-900 bg-gray-50 rounded-lg p-3 text-sm">{incident.voice_message}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Anrufprotokoll ({callLogs.length})</h2>
          <button onClick={fetchData} className="text-sm text-gray-500 hover:text-gray-700">🔄 Aktualisieren</button>
        </div>
        {callLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Keine Anrufe bisher</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b">
                <th className="px-6 py-3">Kontakt</th>
                <th className="px-6 py-3">Twilio Call SID</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Antwort</th>
                <th className="px-6 py-3">Gestartet</th>
                <th className="px-6 py-3">Beendet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {callLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{log.contact?.name ?? `#${log.contact_id}`}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs font-mono">{log.twilio_call_sid || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${callStatusColors[log.status] || 'bg-gray-100 text-gray-800'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{log.response_digit || '—'}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{new Date(log.started_at).toLocaleString('de-CH')}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{log.ended_at ? new Date(log.ended_at).toLocaleString('de-CH') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
