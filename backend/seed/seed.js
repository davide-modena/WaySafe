require('dotenv').config();

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Report = require('../src/models/Report');
const Feedback = require('../src/models/Feedback');
const Evento = require('../src/models/Evento');
const Streetlight = require('../src/models/Streetlight');
const Camera = require('../src/models/Camera');
const Patrol = require('../src/models/Patrol');
const Intervention = require('../src/models/Intervention');
const CrowdLevel = require('../src/models/CrowdLevel');

const dataDir = path.join(__dirname, 'data');
const leggi = (nome) => JSON.parse(fs.readFileSync(path.join(dataDir, nome), 'utf-8'));
const punto = (lat, lng) => ({ type: 'Point', coordinates: [lng, lat] });

const mappaCategoria = {
  illuminazione: 'scarsa_illuminazione',
  sospetti: 'comportamenti_sospetti',
  strade: 'strade_danneggiate',
  altro: 'altro'
};

async function seed() {
  await connectDB();

  await Promise.all([
    Streetlight.deleteMany({}),
    Camera.deleteMany({}),
    Patrol.deleteMany({}),
    Intervention.deleteMany({}),
    CrowdLevel.deleteMany({}),
    Feedback.deleteMany({}),
    Evento.deleteMany({})
  ]);

  const operatore = await User.findOneAndUpdate(
    { email: 'dati.comunali@waysafe.local' },
    { nome: 'Dati', cognome: 'Comunali', email: 'dati.comunali@waysafe.local', ruolo: 'operatore' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Streetlight.insertMany(
    leggi('mockLampioni.json').map((l) => ({
      codice: l.id,
      posizione: punto(l.lat, l.lng),
      radiusM: l.radiusM,
      funzionante: l.working
    }))
  );

  await Camera.insertMany(
    leggi('mockTelecamere.json').map((c) => ({
      codice: c.id,
      posizione: punto(c.lat, c.lng),
      radiusM: c.radiusM,
      attiva: c.attiva,
      tipo: c.tipo
    }))
  );

  await Patrol.insertMany(
    leggi('mockPattugliamenti.json').map((p) => ({
      zona: p.zona,
      posizione: punto(p.lat, p.lng),
      radiusM: p.radiusM,
      giorniSettimana: p.giorniSettimana,
      fasceOrarie: p.fasceOrarie,
      frequenzaSettimanale: p.frequenzaSettimanale
    }))
  );

  await Intervention.insertMany(
    leggi('mockInterventi.json').map((i) => ({
      posizione: punto(i.lat, i.lng),
      tipo: i.tipo,
      data: new Date(i.data),
      count: i.count
    }))
  );

  await CrowdLevel.insertMany(
    leggi('mockAffluenza.json').map((a) => ({
      zona: a.zona,
      posizione: punto(a.lat, a.lng),
      radiusM: a.radiusM,
      densita: a.densita,
      fasceOrarie: a.fasceOrarie
    }))
  );

  await Feedback.insertMany(
    leggi('mockFeedback.json').map((f) => ({
      userId: operatore._id,
      posizione: punto(f.lat, f.lng),
      radiusM: f.radiusM,
      valutazione: f.valutazione
    }))
  );

  await Evento.insertMany(
    leggi('mockEventi.json').map((e) => ({
      operatoreId: operatore._id,
      tipo: e.tipo,
      titolo: e.nome,
      posizione: punto(e.lat, e.lng),
      radiusM: e.radiusM,
      attivo: e.attivo,
      inizioAt: new Date(e.dataInizio),
      fineAt: new Date(e.dataFine)
    }))
  );

  await Report.deleteMany({ userId: operatore._id });
  await Report.insertMany(
    leggi('mockSegnalazioni.json').map((s) => ({
      userId: operatore._id,
      categoria: mappaCategoria[s.categoria] || 'altro',
      posizione: punto(s.lat, s.lng),
      stato: s.stato
    }))
  );

  console.log('Seed completato');
  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error('Seed fallito:', err.message);
  process.exit(1);
});
