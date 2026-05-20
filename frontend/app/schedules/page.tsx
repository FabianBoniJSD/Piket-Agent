'use client'
import { useEffect, useState } from 'react'
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, getContacts, Schedule, ScheduleCreate, Contact } from '@/lib/api'

const emptyForm: ScheduleCreate = { contact_id: 0, start_time: '', end_time: '', active: true }

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<ScheduleCreate>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [s, c] = await Promise.all([getSchedules(), getContacts()])
      setSchedules(s)
      setContacts(c)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const contactName = (id: number) => contacts.find((c) => c.id === id)?.name ?? `#${id}`

  const toDatetimeLocal = (iso: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const openCreate = () => {
    setEditId(null)
    setForm({ ...emptyForm, contact_id: contacts[0]?.id ?? 0 })
    setFormError(null)
    setShowForm(true)
  }

  const openEdit = (s: Schedule) => {
    setEditId(s.id)
    setForm({ contact_id: s.contact_id, start_time: toDatetimeLocal(s.start_time), end_time: toDatetimeLocal(s.end_time), active: s.active })
    setFormError(null)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.contact_id) { setFormError('Person ist erforderlich'); return }
    if (!form.start_time) { setFormError('Startzeit ist erforderlich'); return }
    if (!form.end_time) { setFormError('Endzeit ist erforderlich'); return }
    setSaving(true)
    setFormError(null)
    try {
      if (editId !== null) {
        await updateSchedule(editId, form)
      } else {
        await createSchedule(form)
      }
      setShowForm(false)
      await fetchData()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Eintrag wirklich löschen?')) return
    try {
      await deleteSchedule(id)
      await fetchData()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Löschen')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Piketplan</h1>
        <button onClick={openCreate} disabled={contacts.length === 0}
          title={contacts.length === 0 ? 'Bitte zuerst eine Piketperson erstellen' : undefined}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors">
          + Neuer Eintrag
        </button>
      </div>

      {!loading && contacts.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
          Keine Piketpersonen vorhanden. Bitte zuerst unter <a href="/contacts" className="underline font-medium">Piketpersonen</a> eine Person erstellen.
        </div>
      )}

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-6">{editId !== null ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}</h2>
            {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Person *</label>
                <select required value={form.contact_id} onChange={(e) => setForm({ ...form, contact_id: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value={0}>Person auswählen...</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Von *</label>
                <input type="datetime-local" required value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bis *</label>
                <input type="datetime-local" required value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="sched-active" checked={form.active ?? true} onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                <label htmlFor="sched-active" className="text-sm font-medium text-gray-700">Aktiv</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors">
                  {saving ? 'Speichern...' : 'Speichern'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors">
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Laden...</div>
        ) : schedules.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Keine Einträge vorhanden</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b">
                <th className="px-6 py-3">Person</th>
                <th className="px-6 py-3">Von</th>
                <th className="px-6 py-3">Bis</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schedules.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{s.contact ? s.contact.name : contactName(s.contact_id)}</td>
                  <td className="px-6 py-4 text-gray-600">{new Date(s.start_time).toLocaleString('de-CH')}</td>
                  <td className="px-6 py-4 text-gray-600">{new Date(s.end_time).toLocaleString('de-CH')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${s.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {s.active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors">Bearbeiten</button>
                      <button onClick={() => handleDelete(s.id)} className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors">Löschen</button>
                    </div>
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
