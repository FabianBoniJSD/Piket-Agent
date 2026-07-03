'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AlertTriangle, CalendarRange, ChevronLeft, ChevronRight, Clock3, GripVertical, LayoutGrid, Plus, Rows3, UsersRound } from 'lucide-react'
import { MetricCard } from '@/components/metric-card'
import { PageHeader } from '@/components/page-header'
import { ActiveStateBadge } from '@/components/status-badges'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { createSchedule, deleteSchedule, getContacts, getSchedules, updateSchedule, type Contact, type Schedule, type ScheduleCreate } from '@/lib/api'
import { formatDateTime } from '@/lib/format'

const emptyForm: ScheduleCreate = { contact_id: 0, start_time: '', end_time: '', active: true }

function formatDuration(startTime: string, endTime: string) {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  const hours = Math.max((end - start) / 3_600_000, 0)
  return `${hours.toFixed(1)} h`
}

function getPlannerWindow(schedules: Schedule[]) {
  if (schedules.length === 0) {
    const now = new Date()
    const start = new Date(now)
    start.setHours(now.getHours() - 2, 0, 0, 0)
    const end = new Date(now)
    end.setHours(now.getHours() + 22, 0, 0, 0)
    return { start, end }
  }

  const sortedStarts = schedules
    .map((schedule) => new Date(schedule.start_time))
    .sort((left, right) => left.getTime() - right.getTime())
  const sortedEnds = schedules
    .map((schedule) => new Date(schedule.end_time))
    .sort((left, right) => left.getTime() - right.getTime())

  const start = new Date(sortedStarts[0])
  start.setHours(start.getHours() - 1, 0, 0, 0)
  const end = new Date(sortedEnds[sortedEnds.length - 1])
  end.setHours(end.getHours() + 1, 0, 0, 0)
  return { start, end }
}

function buildTimeColumns(start: Date, end: Date) {
  const columns: Date[] = []
  const cursor = new Date(start)

  while (cursor <= end) {
    columns.push(new Date(cursor))
    cursor.setHours(cursor.getHours() + 2)
  }

  return columns
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function toDatetimeLocalFromDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function getStartOfWeek(date: Date) {
  const start = new Date(date)
  const day = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - day)
  start.setHours(0, 0, 0, 0)
  return start
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function isSameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate()
}

function getBlockPosition(start: Date, end: Date, gridStart: Date, gridEnd: Date) {
  const totalMinutes = Math.max((gridEnd.getTime() - gridStart.getTime()) / 60000, 1)
  const leftMinutes = clamp((start.getTime() - gridStart.getTime()) / 60000, 0, totalMinutes)
  const widthMinutes = clamp((end.getTime() - start.getTime()) / 60000, 30, totalMinutes)

  const left = (leftMinutes / totalMinutes) * 100
  const width = (widthMinutes / totalMinutes) * 100

  return {
    left: `${left}%`,
    width: `${Math.max(width, 6)}%`,
  }
}

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
  const [plannerView, setPlannerView] = useState<'timeline' | 'week'>('timeline')
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()))
  const [draggedScheduleId, setDraggedScheduleId] = useState<number | null>(null)
  const [dragSaving, setDragSaving] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [scheduleData, contactData] = await Promise.all([getSchedules(), getContacts()])
      setSchedules(scheduleData)
      setContacts(contactData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const toDatetimeLocal = (iso: string) => {
    if (!iso) return ''
    const date = new Date(iso)
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  const openCreate = () => {
    setEditId(null)
    setForm({ ...emptyForm, contact_id: contacts[0]?.id ?? 0 })
    setFormError(null)
    setShowForm(true)
  }

  const openEdit = (schedule: Schedule) => {
    setEditId(schedule.id)
    setForm({
      contact_id: schedule.contact_id,
      start_time: toDatetimeLocal(schedule.start_time),
      end_time: toDatetimeLocal(schedule.end_time),
      active: schedule.active,
    })
    setFormError(null)
    setShowForm(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.contact_id) {
      setFormError('Person ist erforderlich')
      return
    }

    if (!form.start_time) {
      setFormError('Startzeit ist erforderlich')
      return
    }

    if (!form.end_time) {
      setFormError('Endzeit ist erforderlich')
      return
    }

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
    if (!window.confirm('Eintrag wirklich löschen?')) return

    try {
      await deleteSchedule(id)
      await fetchData()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Löschen')
    }
  }

  const moveSchedule = async (schedule: Schedule, contactId: number, targetDay?: Date) => {
    const currentStart = new Date(schedule.start_time)
    const currentEnd = new Date(schedule.end_time)
    const durationMs = Math.max(currentEnd.getTime() - currentStart.getTime(), 30 * 60 * 1000)

    const nextStart = new Date(currentStart)
    if (targetDay) {
      nextStart.setFullYear(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate())
    }
    const nextEnd = new Date(nextStart.getTime() + durationMs)

    const isSameContact = schedule.contact_id === contactId
    const isSameTargetDay = !targetDay || isSameDay(currentStart, targetDay)
    if (isSameContact && isSameTargetDay) {
      return
    }

    try {
      setDragSaving(true)
      setError(null)
      await updateSchedule(schedule.id, {
        contact_id: contactId,
        start_time: toDatetimeLocalFromDate(nextStart),
        end_time: toDatetimeLocalFromDate(nextEnd),
        active: schedule.active,
      })
      await fetchData()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Verschieben')
    } finally {
      setDragSaving(false)
      setDraggedScheduleId(null)
    }
  }

  const handleDropToContact = async (contactId: number) => {
    if (draggedScheduleId === null) return
    const schedule = schedules.find((item) => item.id === draggedScheduleId)
    if (!schedule) return
    await moveSchedule(schedule, contactId)
  }

  const handleDropToWeekCell = async (contactId: number, day: Date) => {
    if (draggedScheduleId === null) return
    const schedule = schedules.find((item) => item.id === draggedScheduleId)
    if (!schedule) return
    await moveSchedule(schedule, contactId, day)
  }

  const activeCount = schedules.filter((schedule) => schedule.active).length
  const nextHandover = [...schedules]
    .filter((schedule) => new Date(schedule.end_time).getTime() > Date.now())
    .sort((left, right) => new Date(left.end_time).getTime() - new Date(right.end_time).getTime())[0]
  const plannerWindow = getPlannerWindow(schedules)
  const plannerColumns = buildTimeColumns(plannerWindow.start, plannerWindow.end)
  const scheduleGroups = contacts.map((contact) => ({
    contact,
    items: schedules.filter((schedule) => schedule.contact_id === contact.id),
  }))
  const plannerGridTemplateColumns = `240px repeat(${plannerColumns.length}, minmax(84px, 1fr)) 130px`
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Duty rota"
        title="Map every hand-off across the on-call timeline"
        description="Plane Schichten, Übergaben und aktive Zeitfenster so, dass die Alarmierung immer den richtigen Kontakt zum richtigen Zeitpunkt erreicht."
        actions={
          <Button
            disabled={contacts.length === 0}
            onClick={openCreate}
            title={contacts.length === 0 ? 'Bitte zuerst eine Piketperson erstellen' : undefined}
            variant="accent"
          >
            <Plus />
            Neuer Eintrag
          </Button>
        }
        meta={
          <>
            <div className="glass-panel rounded-[24px] p-4">
              <div className="label-muted">Active shifts</div>
              <div className="mt-3 text-2xl font-semibold text-foreground">{loading ? '...' : activeCount}</div>
              <div className="mt-2 text-sm text-muted-foreground">Zurzeit aktiv gesetzte Zeitfenster im Einsatzplan.</div>
            </div>
            <div className="glass-panel rounded-[24px] p-4">
              <div className="label-muted">Next handover</div>
              <div className="mt-3 text-lg font-semibold text-foreground">{nextHandover ? formatDateTime(nextHandover.end_time) : 'Keine bevorstehende Übergabe'}</div>
              <div className="mt-2 text-sm text-muted-foreground">Der nächste bekannte Übergabepunkt im aktuellen Plan.</div>
            </div>
          </>
        }
      />

      {contacts.length === 0 && !loading ? (
        <Card className="border-warning/25 bg-warning/10">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 text-warning">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5" />
              <div>
                <div className="font-medium">Noch keine Piketpersonen vorhanden</div>
                <div className="mt-1 text-sm text-warning">Lege zuerst unter Piketpersonen einen Kontakt an, bevor du Schichten planst.</div>
              </div>
            </div>
            <Link className={buttonVariants({ variant: 'outline' })} href="/contacts">
              Zu den Piketpersonen
            </Link>
          </CardContent>
        </Card>
      ) : null}

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
          description="Alle geplanten Einsätze und Übergaben im System."
          icon={CalendarRange}
          label="Schedule items"
          tone="brand"
          value={loading ? '...' : schedules.length}
        />
        <MetricCard
          description="Aktuell wirksame oder freigeschaltete Zeitfenster."
          icon={Clock3}
          label="Active"
          tone="success"
          value={loading ? '...' : activeCount}
        />
        <MetricCard
          description="Kontaktbasis, auf der der Einsatzplan aufsetzt."
          icon={UsersRound}
          label="Available contacts"
          tone="accent"
          value={loading ? '...' : contacts.length}
        />
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>{editId !== null ? 'Zeitfenster bearbeiten' : 'Zeitfenster anlegen'}</CardTitle>
              <CardDescription>Plane Start, Ende und Aktivstatus für die zuständige Piketperson.</CardDescription>
            </CardHeader>
            <CardContent>
              {formError ? (
                <div className="mb-6 rounded-[20px] border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{formError}</div>
              ) : null}
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Person *</label>
                  <Select
                    onChange={(event) => setForm({ ...form, contact_id: Number.parseInt(event.target.value, 10) })}
                    required
                    value={form.contact_id}
                  >
                    <option value={0}>Person auswählen...</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>{contact.name}</option>
                    ))}
                  </Select>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Von *</label>
                    <Input onChange={(event) => setForm({ ...form, start_time: event.target.value })} required type="datetime-local" value={form.start_time} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Bis *</label>
                    <Input onChange={(event) => setForm({ ...form, end_time: event.target.value })} required type="datetime-local" value={form.end_time} />
                  </div>
                </div>

                <label className="flex items-center gap-3 rounded-[20px] border border-border bg-muted/35 px-4 py-3 text-sm text-foreground">
                  <Checkbox checked={form.active ?? true} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
                  Zeitfenster sofort als aktiv markieren
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>Piketplan als Baukasten</CardTitle>
              <CardDescription>Ein rasterbasierter Planer im Excel-Stil. Kontakte stehen links, die Zeit läuft oben, Schichten werden als Blöcke dargestellt.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              <span className="rounded-full border border-border bg-muted/50 px-3 py-1">2h Raster</span>
              <span className="rounded-full border border-border bg-muted/50 px-3 py-1">Drag and drop</span>
              <span className="rounded-full border border-border bg-muted/50 px-3 py-1">Schnelle Bearbeitung</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div className="inline-flex rounded-xl border border-border bg-muted/45 p-1">
              <Button className="rounded-lg" onClick={() => setPlannerView('timeline')} size="sm" variant={plannerView === 'timeline' ? 'default' : 'ghost'}>
                <Rows3 className="h-4 w-4" />
                Timeline
              </Button>
              <Button className="rounded-lg" onClick={() => setPlannerView('week')} size="sm" variant={plannerView === 'week' ? 'default' : 'ghost'}>
                <LayoutGrid className="h-4 w-4" />
                Woche
              </Button>
            </div>

            {plannerView === 'week' ? (
              <div className="inline-flex items-center gap-2">
                <Button onClick={() => setWeekStart(addDays(weekStart, -7))} size="sm" variant="secondary">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
                  Woche ab {weekStart.toLocaleDateString('de-DE')}
                </div>
                <Button onClick={() => setWeekStart(addDays(weekStart, 7))} size="sm" variant="secondary">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {dragSaving ? (
            <div className="mb-4 rounded-xl border border-border bg-muted/45 px-4 py-2 text-sm text-muted-foreground">
              Einsatz wird verschoben...
            </div>
          ) : null}
          {loading ? (
            <div className="rounded-[20px] border border-border bg-muted/35 px-6 py-12 text-center text-sm text-muted-foreground">
              Einsatzplan wird geladen...
            </div>
          ) : schedules.length === 0 ? (
            <EmptyState
              action={contacts.length > 0 ? <Button onClick={openCreate} variant="accent"><Plus />Ersten Eintrag erstellen</Button> : undefined}
              description="Lege ein erstes Zeitfenster an, damit das System beim Alerting den zuständigen Kontakt ermitteln kann."
              icon={CalendarRange}
              title="Noch keine Einsätze geplant"
            />
          ) : plannerView === 'week' ? (
            <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <div className="min-w-[980px]">
                  <div className="grid grid-cols-[220px_repeat(7,minmax(120px,1fr))] border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    <div className="sticky left-0 z-20 border-r border-border bg-card px-4 py-3">Person</div>
                    {weekDays.map((day) => (
                      <div className="border-r border-border px-3 py-3 text-center last:border-r-0" key={day.toISOString()}>
                        <div>{day.toLocaleDateString('de-DE', { weekday: 'short' })}</div>
                        <div className="mt-1 text-[11px] normal-case tracking-normal">{day.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</div>
                      </div>
                    ))}
                  </div>

                  <div className="divide-y divide-border">
                    {contacts.map((contact) => (
                      <div className="grid grid-cols-[220px_repeat(7,minmax(120px,1fr))]" key={contact.id}>
                        <div className="sticky left-0 z-10 border-r border-border bg-card px-4 py-4">
                          <div className="font-medium text-foreground">{contact.name}</div>
                        </div>

                        {weekDays.map((day) => {
                          const items = schedules
                            .filter((schedule) => schedule.contact_id === contact.id)
                            .filter((schedule) => isSameDay(new Date(schedule.start_time), day))
                            .sort((left, right) => new Date(left.start_time).getTime() - new Date(right.start_time).getTime())

                          return (
                            <div
                              className="min-h-[112px] border-r border-border bg-muted/15 p-2 last:border-r-0"
                              key={`${contact.id}-${day.toISOString()}`}
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={() => handleDropToWeekCell(contact.id, day)}
                            >
                              <div className="space-y-2">
                                {items.map((schedule) => (
                                  <button
                                    className={`w-full rounded-xl border px-2 py-2 text-left transition hover:border-foreground/20 hover:bg-muted/45 ${
                                      schedule.active ? 'border-brand/30 bg-brand/10' : 'border-border bg-card'
                                    }`}
                                    draggable
                                    key={schedule.id}
                                    onClick={() => openEdit(schedule)}
                                    onDragStart={() => setDraggedScheduleId(schedule.id)}
                                    onDragEnd={() => setDraggedScheduleId(null)}
                                    type="button"
                                  >
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <GripVertical className="h-3.5 w-3.5" />
                                      {new Date(schedule.start_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                                      -
                                      {new Date(schedule.end_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="mt-2">
                                      <ActiveStateBadge active={schedule.active} />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <div className="min-w-[980px]">
                  <div className="grid border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground" style={{ gridTemplateColumns: plannerGridTemplateColumns }}>
                    <div className="sticky left-0 z-20 border-r border-border bg-card px-4 py-4">Person</div>
                    {plannerColumns.map((column, index) => (
                      <div className="border-r border-border px-3 py-4 text-center last:border-r-0" key={column.toISOString()}>
                        <div>{index % 2 === 0 ? column.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                      </div>
                    ))}
                    <div className="px-4 py-4 text-right">Aktionen</div>
                  </div>

                  <div className="divide-y divide-border">
                    {scheduleGroups.map(({ contact, items }) => {
                      const sortedItems = [...items].sort((left, right) => new Date(left.start_time).getTime() - new Date(right.start_time).getTime())

                      return (
                        <div className="grid" key={contact.id} style={{ gridTemplateColumns: plannerGridTemplateColumns }}>
                          <div className="sticky left-0 z-10 border-r border-border bg-card px-4 py-5">
                            <div className="font-medium text-foreground">{contact.name}</div>
                            <div className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">{sortedItems.length} Einträge</div>
                          </div>

                          <div
                            className="relative min-h-[84px] border-r border-border bg-[linear-gradient(to_right,hsl(var(--border)/0.35)_1px,transparent_1px)] bg-[length:100%_100%] px-2 py-2"
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => handleDropToContact(contact.id)}
                            style={{ gridColumn: `span ${plannerColumns.length}` }}
                          >
                            {sortedItems.map((schedule) => {
                              const position = getBlockPosition(new Date(schedule.start_time), new Date(schedule.end_time), plannerWindow.start, plannerWindow.end)

                              return (
                                <button
                                  className={`absolute top-2 flex h-[calc(100%-1rem)] items-center gap-3 rounded-[18px] border px-3 text-left shadow-sm transition hover:-translate-y-0.5 ${
                                    schedule.active ? 'border-brand/25 bg-brand/10 text-foreground' : 'border-border bg-muted/55 text-muted-foreground'
                                  }`}
                                  draggable
                                  key={schedule.id}
                                  onClick={() => openEdit(schedule)}
                                  onDragEnd={() => setDraggedScheduleId(null)}
                                  onDragStart={() => setDraggedScheduleId(schedule.id)}
                                  style={{ left: position.left, width: position.width }}
                                  type="button"
                                >
                                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  <div className="min-w-0">
                                    <div className="truncate text-sm font-medium text-foreground">{formatDateTime(schedule.start_time).slice(0, 16)}</div>
                                    <div className="mt-1 truncate text-xs text-muted-foreground">bis {formatDateTime(schedule.end_time).slice(0, 16)} · {formatDuration(schedule.start_time, schedule.end_time)}</div>
                                    <div className="mt-2 flex items-center gap-2">
                                      <ActiveStateBadge active={schedule.active} />
                                    </div>
                                  </div>
                                </button>
                              )
                            })}
                            {sortedItems.length === 0 ? (
                              <div className="flex h-full items-center justify-center rounded-[16px] border border-dashed border-border bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                                Kein Zeitfenster hinterlegt
                              </div>
                            ) : null}
                          </div>

                          <div className="flex items-center justify-end gap-2 px-4 py-5">
                            <Button onClick={() => {
                              setForm({ ...emptyForm, contact_id: contact.id })
                              setEditId(null)
                              setFormError(null)
                              setShowForm(true)
                            }} size="sm" variant="secondary">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
