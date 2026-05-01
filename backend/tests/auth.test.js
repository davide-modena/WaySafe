const request = require('supertest');
const app = require('../src/app');
const { creaUtente } = require('./helpers');

const base = '/api/v1';

describe('Auth', () => {
  test('register crea un utente e restituisce un token', async () => {
    const res = await request(app).post(`${base}/auth/register`).send({
      nome: 'Anna',
      cognome: 'Verdi',
      email: 'anna.verdi@test.it',
      password: 'password123'
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('anna.verdi@test.it');
    expect(res.body.user.ruolo).toBe('utente');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('register con campi mancanti restituisce 400', async () => {
    const res = await request(app).post(`${base}/auth/register`).send({ email: 'x@test.it' });
    expect(res.status).toBe(400);
  });

  test('register con email duplicata restituisce 409', async () => {
    await creaUtente({ email: 'dup@test.it' });
    const res = await request(app).post(`${base}/auth/register`).send({
      nome: 'Tizio',
      cognome: 'Caio',
      email: 'dup@test.it',
      password: 'password123'
    });
    expect(res.status).toBe(409);
  });

  test('login con credenziali valide restituisce un token', async () => {
    await creaUtente({ email: 'login@test.it', password: 'segreta1' });
    const res = await request(app).post(`${base}/auth/login`).send({
      email: 'login@test.it',
      password: 'segreta1'
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('login con password errata restituisce 401', async () => {
    await creaUtente({ email: 'login2@test.it', password: 'giusta1' });
    const res = await request(app).post(`${base}/auth/login`).send({
      email: 'login2@test.it',
      password: 'sbagliata'
    });
    expect(res.status).toBe(401);
  });

  test('login con campi mancanti restituisce 400', async () => {
    const res = await request(app).post(`${base}/auth/login`).send({ email: 'x@test.it' });
    expect(res.status).toBe(400);
  });
});

describe('Profilo utente', () => {
  test('GET /users/me senza token restituisce 401', async () => {
    const res = await request(app).get(`${base}/users/me`);
    expect(res.status).toBe(401);
  });

  test('GET /users/me con token restituisce il profilo', async () => {
    const { token } = await creaUtente({ email: 'me@test.it' });
    const res = await request(app).get(`${base}/users/me`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('me@test.it');
  });

  test('PATCH /users/me aggiorna lingua e preferenze', async () => {
    const { token } = await creaUtente({ email: 'pref@test.it' });
    const res = await request(app)
      .patch(`${base}/users/me`)
      .set('Authorization', `Bearer ${token}`)
      .send({ lingua: 'en', percorsoPreferito: 'bilanciato' });
    expect(res.status).toBe(200);
    expect(res.body.lingua).toBe('en');
    expect(res.body.percorsoPreferito).toBe('bilanciato');
  });
});
