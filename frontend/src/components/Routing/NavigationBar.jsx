import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { istruzione, formatDistanza } from './routeInstructions';
import './NavigationBar.css';

function distanza(aLat, aLng, bLat, bLng) {
  const R = 6371000;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function NavigationBar({ tappe, userPos, onTermina }) {
  const { t } = useTranslation();
  const corrente = useMemo(() => {
    if (!tappe || tappe.length === 0) return null;
    if (!userPos) return { ...tappe[0], _dist: null };

    let scelta = tappe[0];
    let minDist = Infinity;
    for (const t of tappe) {
      if (!t.location) continue;
      const d = distanza(userPos.lat, userPos.lng, t.location.lat, t.location.lng);
      if (d < minDist) {
        minDist = d;
        scelta = { ...t, _dist: d };
      }
    }
    return scelta;
  }, [tappe, userPos]);

  if (!corrente) return null;

  return (
    <div className="nav-bar">
      <div className="nav-istruzione">
        <strong>{istruzione(corrente, t)}</strong>
        {corrente._dist != null ? (
          <span>{t('route.tra', { dist: formatDistanza(Math.round(corrente._dist)) })}</span>
        ) : (
          <span>{t('route.attesaGps')}</span>
        )}
      </div>
      <button type="button" className="nav-termina" onClick={onTermina}>
        {t('route.termina')}
      </button>
    </div>
  );
}

export default NavigationBar;
