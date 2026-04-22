const manovra = {
  depart: 'Parti',
  arrive: 'Arrivo',
  turn: 'Svolta',
  continue: 'Continua',
  'new name': 'Prosegui',
  merge: 'Immettiti',
  fork: 'Tieni',
  'end of road': 'Fine strada',
  roundabout: 'Rotatoria',
  rotary: 'Rotatoria'
};

const direzione = {
  left: 'a sinistra',
  right: 'a destra',
  'slight left': 'leggermente a sinistra',
  'slight right': 'leggermente a destra',
  'sharp left': 'tutto a sinistra',
  'sharp right': 'tutto a destra',
  straight: 'dritto',
  uturn: 'inverti il senso'
};

export function formatDistanza(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}

export function formatDurata(s) {
  return `${Math.max(1, Math.round(s / 60))} min`;
}

export function istruzione(t) {
  const base = manovra[t.manovra] || 'Prosegui';
  const dir = t.direzione && direzione[t.direzione] ? ` ${direzione[t.direzione]}` : '';
  const strada = t.strada ? ` su ${t.strada}` : '';
  return `${base}${dir}${strada}`;
}
