'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createIncident, IncidentCreate, IncidentPriority } from '@/lib/api'

export default function NewIncidentPage() {
  const router = useRouter()
  const [form, setForm] = useState<IncidentCreate>({ title: '', description: '', priority: 'medium', voice_message: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Titel ist erforderlich'); return }
    if (!form.voice_message.trim()) { setError('Sprachnachricht ist erforderlich'); return }
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
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Neuen Piketfall erstellen</h1>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl shadow p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Titel *</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Kurze Beschreibung des Vorfalls"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung</label>
            <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4}
              placeholder="Detaillierte Beschreibung (optional)"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priorität</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as IncidentPriority })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="low">Low (Niedrig)</option>
              <option value="medium">Medium (Mittel)</option>
              <option value="high">High (Hoch)</option>
              <option value="critical">Critical (Kritisch)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sprachnachricht *</label>
            <textarea required value={form.voice_message} onChange={(e) => setForm({ ...form, voice_message: e.target.value })} rows={4}
              placeholder="Text der telefonisch vorgelesen wird..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="mt-1 text-sm text-gray-500">Dieser Text wird als Sprachnachricht per Telefon vorgelesen.</p>
          </div>
          <div className="flex gap-4 pt-2">
            <button type="submit" disabled={saving} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
              {saving ? 'Erstellen...' : 'Piketfall erstellen'}
            </button>
            <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors">
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
