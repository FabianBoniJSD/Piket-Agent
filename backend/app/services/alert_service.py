from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.config import settings as app_settings
from app.models import AppSettings, CallLog, Contact, Incident, Schedule
from app.services.twilio_service import twilio_service


class AlertService:
    def _get_settings(self, db: Session) -> AppSettings:
        settings_obj = db.query(AppSettings).first()
        if not settings_obj:
            raise ValueError("Application settings not found.")
        return settings_obj

    def _get_on_call_contact(self, db: Session) -> Optional[Contact]:
        now = datetime.utcnow()
        schedule = (
            db.query(Schedule)
            .join(Contact)
            .filter(
                Schedule.active == True,
                Schedule.start_time <= now,
                Schedule.end_time >= now,
                Contact.active == True,
            )
            .order_by(Contact.priority.asc())
            .first()
        )
        if schedule:
            return schedule.contact

        # Fallback: contact with lowest priority number among active contacts
        return (
            db.query(Contact)
            .filter(Contact.active == True)
            .order_by(Contact.priority.asc())
            .first()
        )

    def start_alert(self, db: Session, incident_id: int, base_url: str) -> None:
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            raise ValueError(f"Incident {incident_id} not found.")

        incident.status = "alerting"
        incident.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(incident)

        contact = self._get_on_call_contact(db)
        if not contact:
            incident.status = "failed"
            incident.updated_at = datetime.utcnow()
            db.commit()
            raise ValueError("No active contacts available to alert.")

        self._call_contact(db, incident, contact, base_url)

    def _call_contact(
        self, db: Session, incident: Incident, contact: Contact, base_url: str
    ) -> None:
        settings_obj = self._get_settings(db)

        call_log = CallLog(
            incident_id=incident.id,
            contact_id=contact.id,
            status="initiated",
        )
        db.add(call_log)
        db.commit()
        db.refresh(call_log)

        try:
            call_sid = twilio_service.create_call(
                to_phone=contact.phone_number,
                incident_id=incident.id,
                contact_id=contact.id,
                settings_obj=settings_obj,
                base_url=base_url,
            )
            call_log.twilio_call_sid = call_sid
            call_log.status = "ringing"
        except Exception as exc:
            call_log.status = "failed"
            call_log.ended_at = datetime.utcnow()
            db.commit()
            raise exc

        db.commit()

    def handle_call_response(
        self, db: Session, incident_id: int, contact_id: int, digit: str
    ) -> None:
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            return

        call_log = (
            db.query(CallLog)
            .filter(
                CallLog.incident_id == incident_id,
                CallLog.contact_id == contact_id,
            )
            .order_by(CallLog.id.desc())
            .first()
        )

        if call_log:
            call_log.response_digit = digit
            call_log.ended_at = datetime.utcnow()
            call_log.status = "completed"

        if digit == "1":
            incident.status = "accepted"
            incident.accepted_by_contact_id = contact_id
            incident.updated_at = datetime.utcnow()
            db.commit()
        elif digit == "2":
            db.commit()
            self.escalate(db, incident, contact_id)
        else:
            db.commit()

    def escalate(
        self, db: Session, incident: Incident, current_contact_id: int
    ) -> None:
        settings_obj = self._get_settings(db)

        if not settings_obj.escalation_enabled:
            incident.status = "failed"
            incident.updated_at = datetime.utcnow()
            db.commit()
            return

        current_contact = db.query(Contact).filter(Contact.id == current_contact_id).first()
        current_priority = current_contact.priority if current_contact else -1

        next_contact = (
            db.query(Contact)
            .filter(
                Contact.active == True,
                Contact.id != current_contact_id,
                Contact.priority > current_priority,
            )
            .order_by(Contact.priority.asc(), Contact.id.asc())
            .first()
        )

        # Wrap around: if no lower-urgency contact exists, start from the top (excluding current)
        if not next_contact:
            next_contact = (
                db.query(Contact)
                .filter(
                    Contact.active == True,
                    Contact.id != current_contact_id,
                )
                .order_by(Contact.priority.asc(), Contact.id.asc())
                .first()
            )

        if not next_contact:
            incident.status = "failed"
            incident.updated_at = datetime.utcnow()
            db.commit()
            return

        self._call_contact(db, incident, next_contact, app_settings.BASE_URL)


alert_service = AlertService()
