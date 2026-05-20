from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AppSettings
from app.schemas import AppSettingsResponse, AppSettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=AppSettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    settings_obj = db.query(AppSettings).first()
    if not settings_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Settings not found. Application may not have started correctly.",
        )
    return settings_obj


@router.put("", response_model=AppSettingsResponse)
def update_settings(payload: AppSettingsUpdate, db: Session = Depends(get_db)):
    settings_obj = db.query(AppSettings).first()
    if not settings_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Settings not found. Application may not have started correctly.",
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings_obj, field, value)

    db.commit()
    db.refresh(settings_obj)
    return settings_obj
