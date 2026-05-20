from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models import AppSettings  # noqa: F401 – ensures model is registered
from app.routers.contacts import router as contacts_router
from app.routers.schedules import router as schedules_router
from app.routers.incidents import router as incidents_router
from app.routers.twilio_router import router as twilio_router
from app.routers.settings_router import router as settings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Seed a default AppSettings row if none exists
    db = SessionLocal()
    try:
        if not db.query(AppSettings).first():
            default_settings = AppSettings(
                twilio_account_sid=settings.TWILIO_ACCOUNT_SID,
                twilio_auth_token=settings.TWILIO_AUTH_TOKEN,
                twilio_phone_number=settings.TWILIO_PHONE_NUMBER,
            )
            db.add(default_settings)
            db.commit()
    finally:
        db.close()

    yield


app = FastAPI(
    title="Piket-Alarmierungssystem API",
    description="On-call alerting backend with Twilio voice calls.",
    version="1.0.0",
    lifespan=lifespan,
)

cors_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(contacts_router)
app.include_router(schedules_router)
app.include_router(incidents_router)
app.include_router(twilio_router)
app.include_router(settings_router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
