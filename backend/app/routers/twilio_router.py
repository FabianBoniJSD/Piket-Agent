from datetime import datetime
from fastapi import APIRouter, Depends, Form, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.config import settings as app_settings
from app.database import get_db
from app.models import AppSettings, CallLog, Incident
from app.services.alert_service import alert_service
from app.services.twilio_service import twilio_service

router = APIRouter(prefix="/twilio", tags=["twilio"])


@router.post("/voice")
def voice_handler(
    incident_id: int = Query(...),
    contact_id: int = Query(...),
    db: Session = Depends(get_db),
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        twiml = '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Incident nicht gefunden.</Say></Response>'
        return Response(content=twiml, media_type="application/xml")

    twiml = twilio_service.generate_twiml(
        voice_message=incident.voice_message,
        incident_id=incident_id,
        contact_id=contact_id,
        base_url=app_settings.BASE_URL,
    )
    return Response(content=twiml, media_type="application/xml")


@router.post("/status")
async def status_callback(
    CallSid: str = Form(default=None),
    CallStatus: str = Form(default=None),
    db: Session = Depends(get_db),
):
    if not CallSid:
        return {"ok": True}

    call_log = db.query(CallLog).filter(CallLog.twilio_call_sid == CallSid).first()
    if call_log:
        terminal_statuses = {"completed", "busy", "failed", "no-answer", "canceled"}
        if CallStatus:
            call_log.status = CallStatus
        if CallStatus in terminal_statuses:
            call_log.ended_at = datetime.utcnow()
        db.commit()

    return {"ok": True}


@router.post("/response")
async def digit_response(
    incident_id: int = Query(...),
    contact_id: int = Query(...),
    Digits: str = Form(default=None),
    db: Session = Depends(get_db),
):
    digit = Digits or ""
    alert_service.handle_call_response(
        db=db,
        incident_id=incident_id,
        contact_id=contact_id,
        digit=digit,
    )

    if digit == "1":
        twiml = (
            '<?xml version="1.0" encoding="UTF-8"?>'
            "<Response><Say language=\"de-DE\">Danke. Sie haben den Einsatz akzeptiert.</Say></Response>"
        )
    else:
        twiml = (
            '<?xml version="1.0" encoding="UTF-8"?>'
            "<Response><Say language=\"de-DE\">Danke. Der Anruf wird beendet.</Say></Response>"
        )

    return Response(content=twiml, media_type="application/xml")
