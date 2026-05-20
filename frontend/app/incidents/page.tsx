'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getIncidents, startAlert, Incident } from '@/lib/api'

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

export default function IncidentsPage() {
  const router = useRouter()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alerting, setAlerting] = useState<number | null>(null)

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

  useEffect(() => { fetchIncidents() }, [])

  const handleStartAlert = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setAlerting(id)
    try {
      await startAlert(id)
      await fetchIncidents()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Starten der Alarmierung')
    } finally {
      setAlerting(null)
    }
  }

  const sorted = [...incidents].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Piketvorfälle</h1>
        <Link href="/incidents/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          + Neuer Vorfall
        </Link>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Laden...</div>
        ) : sorted.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Keine Vorfälle vorhanden</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Titel</th>
                <th className="px-6 py-3">Priorität</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Erstellt</th>
                <th className="px-6 py-3">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((incident) => (
                <tr key={incident.id} onClick={() => router.push(`/incidents/${incident.id}`)}
                  className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 text-gray-500 text-sm">#{incident.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{incident.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${priorityColors[incident.priority]}`}>
                      {incident.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[incident.status]}`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(incident.created_at).toLocaleDateString('de-CH')}
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    {(incident.status === 'created' || incident.status === 'failed') && (
                      <button onClick={(e) => handleStartAlert(e, incident.id)} disabled={alerting === incident.id}
                        className="px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 disabled:bg-orange-50 text-orange-700 rounded-lg transition-colors">
                        {alerting === incident.id ? 'Starten...' : '🚨 Alarmierung starten'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
