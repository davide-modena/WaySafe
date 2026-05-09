export function formatDistanza(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}

export function formatDurata(s) {
  return `${Math.max(1, Math.round(s / 60))} min`;
}

export function istruzione(tappa, t) {
  const base = t(`manovra.${tappa.manovra}`, { defaultValue: t('manovra.default') });
  const dirTesto = tappa.direzione ? t(`direzione.${tappa.direzione}`, { defaultValue: '' }) : '';
  const dir = dirTesto ? ` ${dirTesto}` : '';
  const strada = tappa.strada ? ` ${t('route.su', { strada: tappa.strada })}` : '';
  return `${base}${dir}${strada}`;
}
