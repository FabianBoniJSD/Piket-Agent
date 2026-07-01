# Piket-Alert-System

Ein vollständiges Alarmierungssystem für Piketdienste. Ermöglicht es, Piketpersonen automatisiert per Twilio anzurufen und ihnen einen Piketfall mitzuteilen.

## Übersicht

Das System besteht aus:
- **Backend**: FastAPI (Python) mit SQLAlchemy ORM und SQLite/PostgreSQL
- **Frontend**: Next.js 14 (TypeScript) mit Tailwind CSS
- **Twilio**: Automatische Telefonanrufe mit Sprachnachrichten und Tastatureingabe zur Bestätigung

## Funktionen

- 📞 Automatische Telefonanrufe via Twilio mit Text-to-Speech
- 🔄 Automatische Eskalation bei Nicht-Erreichbarkeit
- 👥 Verwaltung von Piketpersonen mit Prioritäten
- 📅 Piketplan-Verwaltung mit Zeitfenstern
- 🚨 Piketfall-Verwaltung mit verschiedenen Prioritätsstufen
- 📋 Vollständige Anruf-Protokollierung
- ⚙️ Konfigurierbare Einstellungen (Wiederholungen, Wartezeiten)
- 🐳 Docker Compose für einfaches Deployment

---

## Setup-Anleitung

### Voraussetzungen

- Python 3.11+
- Node.js 20+
- Docker & Docker Compose (optional)
- ngrok (für lokale Twilio-Webhooks)
- Twilio-Konto (für Telefonanrufe)

### 1. Repository klonen

```bash
git clone <repository-url>
cd piket-alert-system
```

### 2. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
```

Bearbeite `.env` und füge deine Twilio-Zugangsdaten ein:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+41xxxxxxxxx
BASE_URL=https://abc123.ngrok.io  # Deine ngrok-URL
```

---

## Backend starten

```bash
cd backend

# Virtuelle Umgebung erstellen
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Abhängigkeiten installieren
pip install -r requirements.txt

# Server starten
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Der Backend-Server läuft auf http://localhost:8000

API-Dokumentation (Swagger): http://localhost:8000/docs

---

## Frontend starten

```bash
cd frontend

# Abhängigkeiten installieren
yarn install

# Entwicklungsserver starten
yarn dev
```

Das Frontend läuft auf http://localhost:3000

---

## Docker Compose starten

```bash
# Alle Services starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Services stoppen
docker-compose down
```

**Hinweis**: Beim ersten Start werden die Container gebaut. Dies kann einige Minuten dauern.

---

## Twilio-Konfiguration

### 1. Twilio-Konto erstellen

1. Registriere dich auf [twilio.com](https://www.twilio.com)
2. Notiere deine **Account SID** und deinen **Auth Token** (Dashboard)
3. Kaufe eine Telefonnummer mit Voice-Funktion

### 2. Zugangsdaten konfigurieren

Die Twilio-Zugangsdaten können auf zwei Arten gesetzt werden:

**Option A: Umgebungsvariablen** (empfohlen für Produktion)
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+41xxxxxxxxx
```

**Option B: Über die Web-Oberfläche**
1. Öffne http://localhost:3000/settings
2. Trage deine Twilio-Zugangsdaten ein
3. Speichere die Einstellungen

---

## ngrok-Anleitung (lokale Entwicklung)

ngrok erstellt einen öffentlichen Tunnel zu deinem lokalen Server, damit Twilio die Webhooks erreichen kann.

### Installation

```bash
# macOS
brew install ngrok

# Linux / Windows
# Download von https://ngrok.com/download
```

### Tunnel starten

```bash
# Backend-Port tunneln (Port 8000)
ngrok http 8000
```

ngrok zeigt dir eine öffentliche URL, z.B.:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:8000
```

### BASE_URL setzen

Setze diese URL als `BASE_URL` in deiner `.env`:

```env
BASE_URL=https://abc123.ngrok.io
```

**Wichtig**: Starte das Backend nach der Änderung neu.

**Hinweis**: In der kostenlosen Version von ngrok ändert sich die URL bei jedem Neustart.

---

## Beispielablauf für einen Piketfall

### 1. Piketperson erfassen

1. Öffne http://localhost:3000/contacts
2. Klicke "Neue Person"
3. Fülle das Formular aus:
   - Name: Max Muster
   - Telefonnummer: +41791234567
   - Priorität: 1 (niedrigere Zahl = höhere Priorität)
   - Status: Aktiv

### 2. Piketplan erstellen (optional)

1. Öffne http://localhost:3000/schedules
2. Klicke "Neuer Eintrag"
3. Wähle die zuständige Person
4. Setze Start- und Enddatum

### 3. Piketfall erstellen

1. Öffne http://localhost:3000/incidents/new
2. Fülle das Formular aus:
   - Titel: "Serverausfall Produktion"
   - Beschreibung: "Webserver nicht erreichbar"
   - Priorität: Kritisch
   - Sprachnachricht: "Achtung: Kritischer Serverausfall. Bitte sofort eingreifen."

### 4. Alarmierung starten

1. Öffne die Vorfallliste: http://localhost:3000/incidents
2. Klicke "Alarmierung starten" beim entsprechenden Vorfall
3. Das System ruft die zuständige Piketperson an
4. Die Person hört die Sprachnachricht und kann:
   - **Taste 1** drücken: Piketfall angenommen
   - **Taste 2** drücken: Piketfall abgelehnt (nächste Person wird angerufen)

### 5. Status verfolgen

- Öffne http://localhost:3000/incidents/[id]
- Sieh den aktuellen Status und alle Anruf-Logs
- Die Seite aktualisiert sich automatisch während der Alarmierung

---

## API-Endpunkte

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| GET | /health | Health Check |
| GET | /contacts | Alle Kontakte |
| POST | /contacts | Neuen Kontakt erstellen |
| GET | /contacts/{id} | Einzelnen Kontakt |
| PUT | /contacts/{id} | Kontakt aktualisieren |
| DELETE | /contacts/{id} | Kontakt löschen |
| GET | /schedules | Alle Pläne |
| POST | /schedules | Neuen Plan erstellen |
| PUT | /schedules/{id} | Plan aktualisieren |
| DELETE | /schedules/{id} | Plan löschen |
| GET | /incidents | Alle Vorfälle |
| POST | /incidents | Neuen Vorfall erstellen |
| GET | /incidents/{id} | Einzelnen Vorfall |
| POST | /incidents/{id}/start-alert | Alarmierung starten |
| GET | /incidents/{id}/calllogs | Anruf-Logs |
| POST | /twilio/voice | TwiML generieren |
| POST | /twilio/status | Anruf-Status empfangen |
| POST | /twilio/response | Tastatureingabe empfangen |
| GET | /settings | Einstellungen |
| PUT | /settings | Einstellungen aktualisieren |

---

## Projektstruktur

```
piket-alert-system/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI App, CORS, Startup
│   │   ├── config.py        # Pydantic Settings
│   │   ├── database.py      # SQLAlchemy Engine
│   │   ├── models.py        # ORM Modelle
│   │   ├── schemas.py       # Pydantic Schemas
│   │   ├── routers/         # API Router
│   │   └── services/        # Business Logic
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/                 # Next.js App Router Pages
│   ├── lib/api.ts           # Typed API Client
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## PostgreSQL-Migration

```env
DATABASE_URL=postgresql://user:password@localhost:5432/piket_db
```

Dann `pip install psycopg2-binary` und Backend neu starten.

---

## Sicherheitshinweise

- ⚠️ Twilio Auth Token **nie** im Frontend anzeigen oder in Git committen
- 🔒 `.env` in `.gitignore` eintragen
- 🌐 CORS sauber konfigurieren
- 📱 Telefonnummern im E.164-Format (+41791234567)

---

## Lizenz

MIT
