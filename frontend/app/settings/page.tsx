'use client'
import { useEffect, useState } from 'react'
import { getSettings, updateSettings, AppSettings, AppSettingsUpdate } from '@/lib/api'

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [form, setForm] = useState<AppSettingsUpdate>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getSettings()
      .then((s) => {
        setSettings(s)
        setForm({
          twilio_account_sid: s.twilio_account_sid || '',
          twilio_auth_token: s.twilio_auth_token || '',
          twilio_phone_number: s.twilio_phone_number || '',
          max_retries: s.max_retries,
          retry_delay_seconds: s.retry_delay_seconds,
          escalation_enabled: s.escalation_enabled,
        })
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Fehler beim Laden'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const updated = await updateSettings(form)
      setSettings(updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Laden...</div>

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Einstellungen</h1>

      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
        <strong>Hinweis für lokale Entwicklung:</strong> Twilio benötigt eine öffentliche URL für Webhooks.
        Verwende <a href="https://ngrok.com" target="_blank" rel="noopener noreferrer" className="underline">ngrok</a> oder einen ähnlichen Dienst,
        um deine lokale Instanz zu exponieren.
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">✓ Einstellungen gespeichert</div>}

      <div className="bg-white rounded-xl shadow p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Twilio Konfiguration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account SID</label>
                <input type="text" value={form.twilio_account_sid || ''} onChange={(e) => setForm({ ...form, twilio_account_sid: e.target.value })}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auth Token</label>
                <input type="password" value={form.twilio_auth_token || ''} onChange={(e) => setForm({ ...form, twilio_auth_token: e.target.value })}
                  placeholder="••••••••••••••••••••••••••••••••"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefonnummer</label>
                <input type="text" value={form.twilio_phone_number || ''} onChange={(e) => setForm({ ...form, twilio_phone_number: e.target.value })}
                  placeholder="+41xxxxxxxxx"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Alarmierungseinstellungen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximale Wiederholungen</label>
                <input type="number" min={0} max={10} value={form.max_retries ?? 3} onChange={(e) => setForm({ ...form, max_retries: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verzögerung zwischen Versuchen (Sekunden)</label>
                <input type="number" min={10} value={form.retry_delay_seconds ?? 60} onChange={(e) => setForm({ ...form, retry_delay_seconds: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="escalation" checked={form.escalation_enabled ?? true} onChange={(e) => setForm({ ...form, escalation_enabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                <label htmlFor="escalation" className="text-sm font-medium text-gray-700">Eskalation aktivieren (nächste Person kontaktieren wenn keine Antwort)</label>
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
            {saving ? 'Speichern...' : 'Einstellungen speichern'}
          </button>
        </form>
      </div>
    </div>
  )
}
