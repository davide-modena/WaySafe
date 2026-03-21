import { useState } from 'react';
import api from '../../services/api';
import './EmergencyButton.css';

function EmergencyButton() {
  const [aperto, setAperto] = useState(false);
  const [stato, setStato] = useState('idle');
  const [dati, setDati] = useState(null);

  function attiva() {
    setAperto(true);
    setStato('loading');
    setDati(null);

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
    } catch {
      setStato('error');
    }
  }

  function chiudi() {
    setAperto(false);
    setStato('idle');
    setDati(null);
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
                {dati.posizione ? (
                  <p className="emergency-pos">
                    La tua posizione: {dati.posizione.lat.toFixed(5)}, {dati.posizione.lng.toFixed(5)}
                  </p>
                ) : (
                  <p className="emergency-pos">Posizione non disponibile.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default EmergencyButton;
