const request = require('supertest');
const app = require('../src/app');
const Report = require('../src/models/Report');
const { creaUtente } = require('./helpers');

const base = '/api/v1';

describe('Health ed errori', () => {
  test('GET /health restituisce stato ok', async () => {
    const res = await request(app).get(`${base}/health`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('rotta inesistente restituisce 404', async () => {
    const res = await request(app).get(`${base}/inesistente`);
    expect(res.status).toBe(404);
  });
});

describe('Emergenza', () => {
  test('POST /emergency restituisce i numeri utili', async () => {
    const res = await request(app).post(`${base}/emergency`).send({});
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.numeri)).toBe(true);
    expect(res.body.numeri.length).toBeGreaterThan(0);
    expect(res.body.posizione).toBeNull();
  });

  test('POST /emergency con posizione la include nella risposta', async () => {
    const res = await request(app).post(`${base}/emergency`).send({ lat: 46.0667, lng: 11.1217 });
    expect(res.status).toBe(200);
    expect(res.body.posizione).toEqual({ lat: 46.0667, lng: 11.1217 });
  });
});

describe('Routing', () => {
  test('POST /routes/safest senza punti validi restituisce 400', async () => {
    const res = await request(app).post(`${base}/routes/safest`).send({ start: { lat: 46 } });
    expect(res.status).toBe(400);
  });

  test('POST /routes/balanced senza punti validi restituisce 400', async () => {
    const res = await request(app).post(`${base}/routes/balanced`).send({});
    expect(res.status).toBe(400);
  });
});

describe('Heatmap', () => {
  test('GET /heatmap/point senza lat/lng restituisce 400', async () => {
    const res = await request(app).get(`${base}/heatmap/point`);
    expect(res.status).toBe(400);
  });

  test('GET /heatmap con bbox malformato restituisce 400', async () => {
    const res = await request(app).get(`${base}/heatmap?bbox=1,2,3`);
    expect(res.status).toBe(400);
  });
});

describe('Statistiche', () => {
  test('GET /stats senza token restituisce 401', async () => {
    const res = await request(app).get(`${base}/stats`);
    expect(res.status).toBe(401);
  });

  test('GET /stats come utente normale restituisce 403', async () => {
    const { token } = await creaUtente({ email: 'su@test.it' });
    const res = await request(app).get(`${base}/stats`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('GET /stats come operatore restituisce le aggregazioni', async () => {
    const { user } = await creaUtente({ email: 'sa@test.it' });
    const { token } = await creaUtente({ email: 'sop@test.it', ruolo: 'operatore' });
    await Report.create({
      userId: user._id,
      categoria: 'altro',
      posizione: { type: 'Point', coordinates: [11.12, 46.07] },
      stato: 'approvata'
    });
    const res = await request(app).get(`${base}/stats`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.totale).toBe(1);
    expect(Array.isArray(res.body.perCategoria)).toBe(true);
    expect(Array.isArray(res.body.perGiorno)).toBe(true);
  });
});

describe('Notifiche', () => {
  test('GET /notifications senza token restituisce 401', async () => {
    const res = await request(app).get(`${base}/notifications`);
    expect(res.status).toBe(401);
  });

  test('GET /notifications con token restituisce lista e conteggio', async () => {
    const { token } = await creaUtente({ email: 'n@test.it' });
    const res = await request(app).get(`${base}/notifications`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.notifiche)).toBe(true);
    expect(res.body.nonLette).toBe(0);
  });
});
