'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Mail, Pencil, Phone, Plus, Trash2, UserCheck, Users2 } from 'lucide-react'
import { MetricCard } from '@/components/metric-card'
import { PageHeader } from '@/components/page-header'
import { ActiveStateBadge } from '@/components/status-badges'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { createContact, deleteContact, getContacts, updateContact, type Contact, type ContactCreate } from '@/lib/api'

const emptyForm: ContactCreate = {
  name: '',
  phone_number: '',
  email: '',
  active: true,
  priority: 1,
  notes: '',
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<ContactCreate>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fetchContacts = async () => {
    try {
      setLoading(true)
      setError(null)
      setContacts(await getContacts())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const openCreate = () => {
    setEditId(null)
    setForm(emptyForm)
    setFormError(null)
    setShowForm(true)
  }

  const openEdit = (contact: Contact) => {
    setEditId(contact.id)
    setForm({
      name: contact.name,
      phone_number: contact.phone_number,
      email: contact.email || '',
      active: contact.active,
      priority: contact.priority,
      notes: contact.notes || '',
    })
    setFormError(null)
    setShowForm(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.name?.trim()) {
      setFormError('Name ist erforderlich')
      return
    }

    if (!form.phone_number?.trim()) {
      setFormError('Telefonnummer ist erforderlich')
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      if (editId !== null) {
        await updateContact(editId, form)
      } else {
        await createContact(form)
      }
      setShowForm(false)
      await fetchContacts()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Person wirklich löschen?')) return

    try {
      await deleteContact(id)
      await fetchContacts()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Löschen')
    }
  }

  const activeCount = contacts.filter((contact) => contact.active).length
  const inactiveCount = contacts.length - activeCount
  const withEmail = contacts.filter((contact) => Boolean(contact.email)).length

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Crew roster"
        title="Shape the human layer behind every escalation"
        description="Pflege die Piketpersonen mit Priorität, Status und Kontext, damit die Alarmierungslogik im Ernstfall auf die richtigen Kontakte trifft."
        actions={
          <Button onClick={openCreate} variant="accent">
            <Plus />
            Neue Person
          </Button>
        }
        meta={
          <>
            <div className="glass-panel rounded-[24px] p-4">
              <div className="label-muted">Active roster</div>
              <div className="mt-3 text-2xl font-semibold text-foreground">{loading ? '...' : activeCount}</div>
              <div className="mt-2 text-sm text-muted-foreground">Aktiv verfügbare Kontakte im Eskalationspool.</div>
            </div>
            <div className="glass-panel rounded-[24px] p-4">
              <div className="label-muted">Email coverage</div>
              <div className="mt-3 text-2xl font-semibold text-foreground">{loading ? '...' : withEmail}</div>
              <div className="mt-2 text-sm text-muted-foreground">Kontakte mit zusätzlichem Mailkanal für Kontext oder Nachbearbeitung.</div>
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

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          description="Alle Kontakte, die aktuell in der Leitstelle gepflegt werden."
          icon={Users2}
          label="Roster size"
          tone="brand"
          value={loading ? '...' : contacts.length}
        />
        <MetricCard
          description="Kontakte, die für aktive Eskalationsläufe freigegeben sind."
          icon={UserCheck}
          label="Active"
          tone="success"
          value={loading ? '...' : activeCount}
        />
        <MetricCard
          description="Kontakte, die aktuell deaktiviert und nicht alarmierbar sind."
          icon={AlertTriangle}
          label="Inactive"
          tone="accent"
          value={loading ? '...' : inactiveCount}
        />
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>{editId !== null ? 'Person bearbeiten' : 'Neue Person anlegen'}</CardTitle>
              <CardDescription>Kontaktdaten, Priorität und Status bestimmen die Position im Eskalationsablauf.</CardDescription>
            </CardHeader>
            <CardContent>
              {formError ? (
                <div className="mb-6 rounded-[20px] border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{formError}</div>
              ) : null}
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Name *</label>
                    <Input onChange={(event) => setForm({ ...form, name: event.target.value })} required value={form.name} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Telefonnummer *</label>
                    <Input onChange={(event) => setForm({ ...form, phone_number: event.target.value })} required type="tel" value={form.phone_number} />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">E-Mail</label>
                    <Input onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" value={form.email || ''} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Priorität</label>
                    <Input
                      min={1}
                      onChange={(event) => setForm({ ...form, priority: Number.parseInt(event.target.value || '1', 10) })}
                      type="number"
                      value={form.priority ?? 1}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Notizen</label>
                  <Textarea onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={4} value={form.notes || ''} />
                </div>

                <label className="flex items-center gap-3 rounded-[20px] border border-border bg-muted/35 px-4 py-3 text-sm text-foreground">
                  <Checkbox checked={form.active ?? true} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
                  Aktiv im Eskalationspool führen
                </label>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button disabled={saving} type="submit" variant="accent">
                    {saving ? 'Speichert...' : 'Speichern'}
                  </Button>
                  <Button onClick={() => setShowForm(false)} type="button" variant="secondary">
                    Abbrechen
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Kontaktübersicht</CardTitle>
          <CardDescription>Die Liste ist so gestaltet, dass Priorität, Status und Kommunikationskanäle schnell erfassbar bleiben.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="rounded-[20px] border border-border bg-muted/35 px-6 py-12 text-center text-sm text-muted-foreground">
              Kontakte werden geladen...
            </div>
          ) : contacts.length === 0 ? (
            <EmptyState
              action={
                <Button onClick={openCreate} variant="accent">
                  <Plus />
                  Erste Person anlegen
                </Button>
              }
              description="Lege die erste Piketperson an, um Einsatzplan und Eskalation in Betrieb zu nehmen."
              icon={Users2}
              title="Noch keine Piketpersonen vorhanden"
            />
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priorität</TableHead>
                  <TableHead>Notizen</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="font-medium text-foreground">{contact.name}</div>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{contact.phone_number}</span>
                          <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{contact.email || 'Keine E-Mail'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ActiveStateBadge active={contact.active} />
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex rounded-full border border-border bg-muted/55 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                        P {contact.priority}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs text-muted-foreground">{contact.notes || 'Keine Notizen'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => openEdit(contact)} size="sm" variant="secondary">
                          <Pencil className="h-4 w-4" />
                          Bearbeiten
                        </Button>
                        <Button onClick={() => handleDelete(contact.id)} size="sm" variant="danger">
                          <Trash2 className="h-4 w-4" />
                          Löschen
                        </Button>
                      </div>
                    </TableCell>
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
