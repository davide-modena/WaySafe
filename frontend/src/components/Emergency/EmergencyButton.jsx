import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import './EmergencyButton.css';

function formatIndirizzo(d) {
  if (!d) return null;
  const a = d.address || {};
  const via = a.road || a.pedestrian || a.footway || a.path || a.neighbourhood;
  const civico = a.house_number;
  const citta = a.city || a.town || a.village || a.municipality;
  const parti = [];
  if (via) parti.push(civico ? `${via} ${civico}` : via);
  if (citta) parti.push(citta);
  return parti.length ? parti.join(', ') : d.display_name || null;
}

function EmergencyButton() {
  const { t } = useTranslation();
  const [aperto, setAperto] = useState(false);
  const [stato, setStato] = useState('idle');
  const [dati, setDati] = useState(null);
  const [indirizzo, setIndirizzo] = useState(null);

  function attiva() {
    setAperto(true);
    setStato('loading');
    setDati(null);
    setIndirizzo(null);

    if (!navigator.geolocation) {
      invia(null, null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => invia(pos.coords.latitude, pos.coords.longitude),
      () => invia(null, null),
      { timeout: 8000 }
    );
  }

  async function invia(lat, lng) {
    try {
      const body = lat !== null && lng !== null ? { lat, lng } : {};
      const { data } = await api.post('/emergency', body);
      setDati(data);
      setStato('ok');
      if (lat !== null && lng !== null) reverseGeocode(lat, lng);
    } catch {
      setStato('error');
    }
  }

  function reverseGeocode(lat, lng) {
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&zoom=18&addressdetails=1&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'it' } }
    )
      .then((r) => r.json())
      .then((d) => setIndirizzo(formatIndirizzo(d)))
      .catch(() => setIndirizzo(null));
  }

  function chiudi() {
    setAperto(false);
    setStato('idle');
    setDati(null);
    setIndirizzo(null);
  }

  useEffect(() => {
    if (!aperto) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') chiudi();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [aperto]);

  return (
    <>
      <button type="button" className="emergency-fab" onClick={attiva} aria-label={t('emergency.titolo')}>
        SOS
      </button>

      {aperto && (
        <div className="emergency-overlay" onClick={chiudi}>
          <div
            className="emergency-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="emergency-titolo"
          >
            <button type="button" className="emergency-close" onClick={chiudi} aria-label={t('emergency.chiudi')}>
              ×
            </button>
            <h2 id="emergency-titolo">{t('emergency.titolo')}</h2>

            {stato === 'loading' && <p aria-live="polite">{t('emergency.rilevamento')}</p>}
            {stato === 'error' && (
              <p className="emergency-error" role="alert">{t('emergency.errore')}</p>
            )}
            {stato === 'ok' && dati && (
              <>
                {dati.posizione && (
                  <div className="emergency-luogo">
                    <span className="emergency-luogo-label">{t('emergency.tuaPosizione')}</span>
                    <strong>{indirizzo || t('emergency.indirizzoRicerca')}</strong>
                    <span className="emergency-pos">
                      {dati.posizione.lat.toFixed(5)}, {dati.posizione.lng.toFixed(5)}
                    </span>
                  </div>
                )}
                {!dati.posizione && <p className="emergency-pos">{t('emergency.posizioneNonDisp')}</p>}

                <ul className="emergency-numbers">
                  {dati.numeri.map((n) => (
                    <li key={n.numero}>
                      <a href={`tel:${n.numero}`}>
                        <span>{n.nome}</span>
                        <strong>{n.numero}</strong>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default EmergencyButton;
