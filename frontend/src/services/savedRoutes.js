const KEY_CRONOLOGIA = 'waysafe_cronologia';
const KEY_PREFERITO = 'waysafe_percorso_preferito';

function leggi(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

export function getCronologia() {
  return leggi(KEY_CRONOLOGIA) || [];
}

export function aggiungiCronologia(voce) {
  const lista = getCronologia().filter((v) => !(v.da === voce.da && v.a === voce.a));
  lista.unshift(voce);
  localStorage.setItem(KEY_CRONOLOGIA, JSON.stringify(lista.slice(0, 10)));
}

export function rimuoviCronologia(id) {
  const lista = getCronologia().filter((v) => v.id !== id);
  localStorage.setItem(KEY_CRONOLOGIA, JSON.stringify(lista));
}

export function getPreferito() {
  return leggi(KEY_PREFERITO);
}

export function setPreferito(voce) {
  localStorage.setItem(KEY_PREFERITO, JSON.stringify(voce));
}

export function rimuoviPreferito() {
  localStorage.removeItem(KEY_PREFERITO);
}
