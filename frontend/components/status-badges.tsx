import { AlertTriangle, CheckCircle2, Clock3, PhoneCall, Power, Siren, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { type CallStatus, type IncidentPriority, type IncidentStatus } from '@/lib/api'

const priorityMap: Record<IncidentPriority, { label: string; variant: 'success' | 'warning' | 'brand' | 'danger' }> = {
  low: { label: 'Niedrig', variant: 'success' },
  medium: { label: 'Mittel', variant: 'warning' },
  high: { label: 'Hoch', variant: 'brand' },
  critical: { label: 'Kritisch', variant: 'danger' },
}

const statusMap: Record<IncidentStatus, { label: string; variant: 'neutral' | 'brand' | 'success' | 'danger'; icon: React.ReactNode }> = {
  created: { label: 'Erstellt', variant: 'neutral', icon: <Clock3 className="h-3.5 w-3.5" /> },
  alerting: { label: 'Alarmiert', variant: 'brand', icon: <Siren className="h-3.5 w-3.5" /> },
  accepted: { label: 'Akzeptiert', variant: 'success', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  failed: { label: 'Fehlgeschlagen', variant: 'danger', icon: <XCircle className="h-3.5 w-3.5" /> },
  cancelled: { label: 'Abgebrochen', variant: 'neutral', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
}

const callMap: Record<CallStatus, { label: string; variant: 'neutral' | 'brand' | 'success' | 'warning' | 'danger'; icon: React.ReactNode }> = {
  queued: { label: 'Queued', variant: 'neutral', icon: <Clock3 className="h-3.5 w-3.5" /> },
  ringing: { label: 'Ringing', variant: 'warning', icon: <PhoneCall className="h-3.5 w-3.5" /> },
  'in-progress': { label: 'In Progress', variant: 'brand', icon: <Siren className="h-3.5 w-3.5" /> },
  initiated: { label: 'Initiated', variant: 'brand', icon: <PhoneCall className="h-3.5 w-3.5" /> },
  completed: { label: 'Completed', variant: 'success', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  failed: { label: 'Failed', variant: 'danger', icon: <XCircle className="h-3.5 w-3.5" /> },
  'no-answer': { label: 'No Answer', variant: 'warning', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  busy: { label: 'Busy', variant: 'warning', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
}

export function IncidentPriorityBadge({ priority }: { priority: IncidentPriority }) {
  const config = priorityMap[priority]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  const config = statusMap[status]
  return (
    <Badge variant={config.variant}>
      {config.icon}
      {config.label}
    </Badge>
  )
}

export function CallStatusBadge({ status }: { status: CallStatus }) {
  const config = callMap[status] ?? callMap.failed
  return (
    <Badge variant={config.variant}>
      {config.icon}
      {config.label}
    </Badge>
  )
}

export function ActiveStateBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? 'success' : 'neutral'}>
      <Power className="h-3.5 w-3.5" />
      {active ? 'Aktiv' : 'Inaktiv'}
    </Badge>
  )
}