const request = require('supertest');
const app = require('../src/app');
const Report = require('../src/models/Report');
const { creaUtente } = require('./helpers');

const base = '/api/v1';

async function creaSegnalazione(userId, stato = 'in_attesa') {
  return Report.create({
    userId,
    categoria: 'scarsa_illuminazione',
    posizione: { type: 'Point', coordinates: [11.1217, 46.0667] },
    descrizione: 'Test',
    stato
  });
}

describe('Segnalazioni', () => {
  test('GET /reports restituisce un array', async () => {
    const res = await request(app).get(`${base}/reports`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /reports mostra solo le segnalazioni approvate di default', async () => {
    const { user } = await creaUtente({ email: 'a@test.it' });
    await creaSegnalazione(user._id, 'in_attesa');
    await creaSegnalazione(user._id, 'approvata');
    const res = await request(app).get(`${base}/reports`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].stato).toBe('approvata');
  });

  test('POST /reports senza token restituisce 401', async () => {
    const res = await request(app).post(`${base}/reports`).send({
      categoria: 'altro',
      lat: 46.0667,
      lng: 11.1217
    });
    expect(res.status).toBe(401);
  });

  test('POST /reports con token crea la segnalazione', async () => {
    const { token } = await creaUtente({ email: 'b@test.it' });
    const res = await request(app)
      .post(`${base}/reports`)
      .set('Authorization', `Bearer ${token}`)
      .send({ categoria: 'comportamenti_sospetti', lat: 46.07, lng: 11.12, descrizione: 'Buio' });
    expect(res.status).toBe(201);
    expect(res.body.stato).toBe('in_attesa');
    expect(res.body.posizione.coordinates).toEqual([11.12, 46.07]);
  });

  test('POST /reports senza categoria restituisce 400', async () => {
    const { token } = await creaUtente({ email: 'c@test.it' });
    const res = await request(app)
      .post(`${base}/reports`)
      .set('Authorization', `Bearer ${token}`)
      .send({ lat: 46.07, lng: 11.12 });
    expect(res.status).toBe(400);
  });
});

describe('Operatore', () => {
  test('PATCH /reports/:id come utente normale restituisce 403', async () => {
    const { user, token } = await creaUtente({ email: 'u@test.it' });
    const report = await creaSegnalazione(user._id);
    const res = await request(app)
      .patch(`${base}/reports/${report._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stato: 'approvata' });
    expect(res.status).toBe(403);
  });

  test('PATCH /reports/:id come operatore aggiorna lo stato', async () => {
    const { user } = await creaUtente({ email: 'autore@test.it' });
    const { token } = await creaUtente({ email: 'op@test.it', ruolo: 'operatore' });
    const report = await creaSegnalazione(user._id);
    const res = await request(app)
      .patch(`${base}/reports/${report._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stato: 'approvata' });
    expect(res.status).toBe(200);
    expect(res.body.stato).toBe('approvata');
  });

  test('PATCH /reports/:id con stato non valido restituisce 400', async () => {
    const { user } = await creaUtente({ email: 'autore2@test.it' });
    const { token } = await creaUtente({ email: 'op2@test.it', ruolo: 'operatore' });
    const report = await creaSegnalazione(user._id);
    const res = await request(app)
      .patch(`${base}/reports/${report._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stato: 'inesistente' });
    expect(res.status).toBe(400);
  });

  test('GET /operator/reports come utente normale restituisce 403', async () => {
    const { token } = await creaUtente({ email: 'u2@test.it' });
    const res = await request(app)
      .get(`${base}/operator/reports`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('GET /operator/reports come operatore restituisce le segnalazioni in attesa', async () => {
    const { user } = await creaUtente({ email: 'autore3@test.it' });
    const { token } = await creaUtente({ email: 'op3@test.it', ruolo: 'operatore' });
    await creaSegnalazione(user._id, 'in_attesa');
    const res = await request(app)
      .get(`${base}/operator/reports`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('approvazione segnalazione genera una notifica per l autore', async () => {
    const Notification = require('../src/models/Notification');
    const { user } = await creaUtente({ email: 'autore4@test.it' });
    const { token } = await creaUtente({ email: 'op4@test.it', ruolo: 'operatore' });
    const report = await creaSegnalazione(user._id);
    await request(app)
      .patch(`${base}/reports/${report._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stato: 'approvata' });
    const notifiche = await Notification.find({ userId: user._id });
    expect(notifiche).toHaveLength(1);
    expect(notifiche[0].reportId.toString()).toBe(report._id.toString());
  });
});
