# WaySafe

Con WaySafe, Trento gets way safer.

WaySafe è una web app che aiuta le persone a muoversi in città in modo più sicuro:
calcolo di percorsi sicuri, mappa del livello di sicurezza delle zone, segnalazioni
geolocalizzate e pulsante di emergenza.

## Struttura del repository

Il progetto è organizzato come monorepo:

```
WaySafe/
├── backend/      API REST (Node.js + Express + MongoDB)
├── frontend/     Web app (React + Leaflet)
└── README.md
```

## Requisiti

- Node.js 18+
- Account MongoDB Atlas (o istanza MongoDB locale)
- Credenziali Google OAuth 2.0 per il login con Google

## Avvio in locale

Backend:

```
cd backend
cp .env.example .env
npm install
npm run dev
```

Frontend:

```
cd frontend
cp .env.example .env
npm install
npm start
```

Il backend espone le API su `http://localhost:5000/api/v1`, il frontend gira su
`http://localhost:3000`.

## Strategia di branching

Il progetto usa un modello GitFlow semplificato: `main` per la produzione,
`develop` per l'integrazione e branch `feature/<nome>` per le singole
funzionalità.

## Variabili d'ambiente

Le variabili necessarie sono elencate nei file `.env.example` di `backend/` e
`frontend/`. Non vanno mai committati i file `.env` reali.
