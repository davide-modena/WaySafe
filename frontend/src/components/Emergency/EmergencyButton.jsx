import { useState } from 'react';
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

  return (
    <>
      <button type="button" className="emergency-fab" onClick={attiva} aria-label="Emergenza">
        SOS
      </button>

      {aperto && (
        <div className="emergency-overlay" onClick={chiudi}>
          <div className="emergency-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="emergency-close" onClick={chiudi} aria-label="Chiudi">
              ×
            </button>
            <h2>Emergenza</h2>

            {stato === 'loading' && <p>Rilevamento posizione in corso…</p>}
            {stato === 'error' && (
              <p className="emergency-error">Servizio non raggiungibile. Chiama comunque il 112.</p>
            )}
            {stato === 'ok' && dati && (
              <>
                {dati.posizione && (
                  <div className="emergency-luogo">
                    <span className="emergency-luogo-label">La tua posizione</span>
                    <strong>{indirizzo || 'Indirizzo in ricerca…'}</strong>
                    <span className="emergency-pos">
                      {dati.posizione.lat.toFixed(5)}, {dati.posizione.lng.toFixed(5)}
                    </span>
                  </div>
                )}
                {!dati.posizione && <p className="emergency-pos">Posizione non disponibile.</p>}

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
