from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


# ── Contact ──────────────────────────────────────────────────────────────────

class ContactBase(BaseModel):
    name: str
    phone_number: str
    email: Optional[str] = None
    active: bool = True
    priority: int = 0
    notes: Optional[str] = None


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    active: Optional[bool] = None
    priority: Optional[int] = None
    notes: Optional[str] = None


class ContactResponse(ContactBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


# ── Schedule ──────────────────────────────────────────────────────────────────

class ScheduleBase(BaseModel):
    contact_id: int
    start_time: datetime
    end_time: datetime
    active: bool = True


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleUpdate(BaseModel):
    contact_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    active: Optional[bool] = None


class ScheduleResponse(ScheduleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


# ── Incident ──────────────────────────────────────────────────────────────────

class IncidentBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    voice_message: str


class IncidentCreate(IncidentBase):
    pass


class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    voice_message: Optional[str] = None
    status: Optional[str] = None


class IncidentResponse(IncidentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    accepted_by_contact_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime


# ── CallLog ───────────────────────────────────────────────────────────────────

class CallLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    incident_id: int
    contact_id: int
    twilio_call_sid: Optional[str] = None
    status: str
    response_digit: Optional[str] = None
    started_at: datetime
    ended_at: Optional[datetime] = None
    created_at: datetime


# ── AppSettings ───────────────────────────────────────────────────────────────

class AppSettingsBase(BaseModel):
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    max_retries: int = 3
    retry_delay_seconds: int = 60
    escalation_enabled: bool = True


class AppSettingsUpdate(BaseModel):
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    max_retries: Optional[int] = None
    retry_delay_seconds: Optional[int] = None
    escalation_enabled: Optional[bool] = None


class AppSettingsResponse(AppSettingsBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
