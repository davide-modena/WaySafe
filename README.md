# WaySafe

Con WaySafe, Trento gets way safer.

WaySafe è una web app che aiuta le persone a muoversi in città in modo più sicuro:
calcolo di percorsi sicuri, mappa del livello di sicurezza delle zone, segnalazioni
geolocalizzate e pulsante di emergenza.

## Link

- **App (frontend):** https://waysafe.onrender.com
- **API (backend):** https://waysafe-backend.onrender.com/api/v1
- **Documentazione API (Swagger):** https://app.swaggerhub.com/apis/waysafe/waysafe-openapi-30/1.0
- **Documentazione API (Apiary):** https://waysafe.docs.apiary.io/
- **Specifica OpenAPI:** [`docs/openapi.yaml`](docs/openapi.yaml)

### Account demo

| Ruolo | Email | Password |
|-------|-------|----------|
| Utente | giulia.verdi@gmail.com | gverdi |
| Operatore | mario.rossi@gmail.com | mrossi |

## Struttura del repository

Il progetto è organizzato come monorepo:

```
WaySafe/
├── backend/      API REST (Node.js + Express + MongoDB)
├── frontend/     Web app (React + Leaflet)
├── docs/         Specifica OpenAPI delle API
└── README.md
```

## Requisiti

- Node.js 18+
- Account MongoDB Atlas (o istanza MongoDB locale)
- Credenziali Google OAuth 2.0 per il login con Google (facoltative)

## Avvio in locale

### 1. Backend

```bash
cd backend
cp .env.example .env      # poi compila le variabili (vedi sotto)
npm install
npm run seed              # popola il database con i dati di sicurezza (una volta sola)
npm run dev               # avvia il server con nodemon
```

Il backend espone le API su `http://localhost:5000/api/v1`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

Il frontend gira su `http://localhost:3000` e si collega al backend tramite
`REACT_APP_API_URL`.

## Variabili d'ambiente

Le variabili necessarie sono elencate nei file `.env.example` di `backend/` e
`frontend/`. I file `.env` reali non vanno mai committati.

**Backend** (`backend/.env`):

| Variabile | Descrizione |
|-----------|-------------|
| `PORT` | Porta del server (default `5000`) |
| `MONGODB_URI` | Stringa di connessione a MongoDB |
| `JWT_SECRET` | Segreto per la firma dei token JWT |
| `JWT_EXPIRES_IN` | Scadenza del token (default `15m`) |
| `CLIENT_URL` | Origine del frontend (CORS + redirect OAuth) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Credenziali Google OAuth (facoltative) |
| `GOOGLE_CALLBACK_URL` | URL di callback OAuth |
| `OSRM_URL` | Servizio di routing pedonale (default OSRM FOSSGIS) |

**Frontend** (`frontend/.env`):

| Variabile | Descrizione |
|-----------|-------------|
| `REACT_APP_API_URL` | URL base delle API |
| `REACT_APP_DEFAULT_LAT` / `LNG` / `ZOOM` | Centro e zoom iniziale della mappa |

## Test

```bash
cd backend
npm test
```

I test (Jest + Supertest) vengono eseguiti su un'istanza MongoDB in memoria, quindi
non richiedono un database esterno.

## Strategia di branching

Il progetto usa un modello GitFlow: `main` per la produzione, `develop` per
l'integrazione e branch `feature/<nome>` per le singole funzionalità.

## Stack tecnologico

- **Frontend:** React (CRA), react-leaflet, react-router, axios, react-i18next (IT/EN/DE)
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB (indici geospaziali 2dsphere)
- **Autenticazione:** JWT + bcrypt, Google OAuth (Passport)
- **Servizi esterni:** OSRM (routing pedonale), OpenStreetMap / Nominatim, Stadia Maps (tile)
- **CI/CD:** GitHub Actions, deploy su Render
