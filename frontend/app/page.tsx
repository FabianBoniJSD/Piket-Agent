'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getIncidents, Incident } from '@/lib/api'

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

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getIncidents()
      setIncidents(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const total = incidents.length
  const alerting = incidents.filter((i) => i.status === 'alerting').length
  const accepted = incidents.filter((i) => i.status === 'accepted').length
  const recent = [...incidents].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-3">
          <button onClick={fetchData} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium transition-colors">
            🔄 Aktualisieren
          </button>
          <Link href="/incidents/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            + Neuen Piketfall erstellen
          </Link>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500 font-medium">Total Vorfälle</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{loading ? '...' : total}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500 font-medium">Aktive Alarmierungen</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">{loading ? '...' : alerting}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-500 font-medium">Akzeptiert</p>
          <p className="text-4xl font-bold text-green-600 mt-2">{loading ? '...' : accepted}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Neueste Vorfälle</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Laden...</div>
        ) : recent.length === 0 ? (
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recent.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500 text-sm">#{incident.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <Link href={`/incidents/${incident.id}`} className="hover:text-blue-600">{incident.title}</Link>
                  </td>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
