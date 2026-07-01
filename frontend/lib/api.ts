const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE) {
  throw new Error('NEXT_PUBLIC_API_URL is not set. Please configure it in your environment.');
}

// Types
export interface Contact { id: number; name: string; phone_number: string; email?: string; active: boolean; priority: number; notes?: string; created_at: string; updated_at: string; }
export interface ContactCreate { name: string; phone_number: string; email?: string; active?: boolean; priority?: number; notes?: string; }
export interface ContactUpdate extends Partial<ContactCreate> {}

export interface Schedule { id: number; contact_id: number; start_time: string; end_time: string; active: boolean; created_at: string; updated_at: string; contact?: Contact; }
export interface ScheduleCreate { contact_id: number; start_time: string; end_time: string; active?: boolean; }
export interface ScheduleUpdate extends Partial<ScheduleCreate> {}

export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'created' | 'alerting' | 'accepted' | 'failed' | 'cancelled';
export interface Incident { id: number; title: string; description?: string; priority: IncidentPriority; voice_message: string; status: IncidentStatus; accepted_by_contact_id?: number; created_at: string; updated_at: string; }
export interface IncidentCreate { title: string; description?: string; priority?: IncidentPriority; voice_message: string; }

export type CallStatus = 'queued' | 'ringing' | 'in-progress' | 'initiated' | 'completed' | 'failed' | 'no-answer' | 'busy';
export interface CallLog { id: number; incident_id: number; contact_id: number; twilio_call_sid?: string; status: CallStatus; response_digit?: string; started_at: string; ended_at?: string; created_at: string; contact?: Contact; }

export interface AppSettings { id: number; twilio_account_sid?: string; twilio_auth_token?: string; twilio_phone_number?: string; max_retries: number; retry_delay_seconds: number; escalation_enabled: boolean; }
export interface AppSettingsUpdate { twilio_account_sid?: string; twilio_auth_token?: string; twilio_phone_number?: string; max_retries?: number; retry_delay_seconds?: number; escalation_enabled?: boolean; }

// Helper
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || 'API Error');
  }
  return res.json();
}

// Contacts
export const getContacts = () => apiFetch<Contact[]>('/contacts');
export const getContact = (id: number) => apiFetch<Contact>(`/contacts/${id}`);
export const createContact = (data: ContactCreate) => apiFetch<Contact>('/contacts', { method: 'POST', body: JSON.stringify(data) });
export const updateContact = (id: number, data: ContactUpdate) => apiFetch<Contact>(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteContact = (id: number) => apiFetch<void>(`/contacts/${id}`, { method: 'DELETE' });

// Schedules
export const getSchedules = () => apiFetch<Schedule[]>('/schedules');
export const createSchedule = (data: ScheduleCreate) => apiFetch<Schedule>('/schedules', { method: 'POST', body: JSON.stringify(data) });
export const updateSchedule = (id: number, data: ScheduleUpdate) => apiFetch<Schedule>(`/schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSchedule = (id: number) => apiFetch<void>(`/schedules/${id}`, { method: 'DELETE' });

// Incidents
export const getIncidents = () => apiFetch<Incident[]>('/incidents');
export const getIncident = (id: number) => apiFetch<Incident>(`/incidents/${id}`);
export const createIncident = (data: IncidentCreate) => apiFetch<Incident>('/incidents', { method: 'POST', body: JSON.stringify(data) });
export const startAlert = (id: number) => apiFetch<{ message: string }>(`/incidents/${id}/start-alert`, { method: 'POST' });
export const getIncidentCallLogs = (id: number) => apiFetch<CallLog[]>(`/incidents/${id}/calllogs`);

// Settings
export const getSettings = () => apiFetch<AppSettings>('/settings');
export const updateSettings = (data: AppSettingsUpdate) => apiFetch<AppSettings>('/settings', { method: 'PUT', body: JSON.stringify(data) });
