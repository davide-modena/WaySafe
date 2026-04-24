import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { categoriaLabel } from '../Map/reportCategories';
import { reverseGeocode } from '../../services/geocode';
import './ReportControl.css';

const categorie = ['scarsa_illuminazione', 'comportamenti_sospetti', 'strade_danneggiate', 'altro'];

function ReportControl({ punto, pickMode, onAvviaPick, onAnnullaPick, onSetPunto, onReset }) {
  const { isAuthenticated } = useAuth();
  const [aperto, setAperto] = useState(false);
  const [categoria, setCategoria] = useState('scarsa_illuminazione');
  const [descrizione, setDescrizione] = useState('');
  const [stato, setStato] = useState('idle');
  const [errore, setErrore] = useState('');

  function apri() {
    setAperto(true);
    setStato('idle');
    setErrore('');
  }

  function chiudi() {
    setAperto(false);
    setDescrizione('');
    setCategoria('scarsa_illuminazione');
    onReset();
  }

  function usaGps() {
    setErrore('');
    if (!navigator.geolocation) {
      setErrore('Geolocalizzazione non disponibile');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const indirizzo = await reverseGeocode(latitude, longitude);
        onSetPunto({ lat: latitude, lng: longitude, indirizzo });
      },
      () => setErrore('Posizione non rilevata'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function invia(e) {
    e.preventDefault();
    if (!isAuthenticated) {
      setErrore('Devi essere autenticato per inviare una segnalazione');
      return;
    }
    if (!punto) {
      setErrore('Scegli prima una posizione');
      return;
    }
    setStato('loading');
    setErrore('');
    try {
      await api.post('/reports', {
        categoria,
        lat: punto.lat,
        lng: punto.lng,
        descrizione: descrizione.trim() || undefined
      });
      setStato('ok');
    } catch (err) {
      setStato('idle');
      setErrore((err.response && err.response.data && err.response.data.error) || 'Invio non riuscito');
    }
  }

  return (
    <>
      <button type="button" className="report-fab" onClick={apri} aria-label="Nuova segnalazione">
        +
      </button>

      {aperto && pickMode && (
        <div className="report-pick">
          <span>Tocca la mappa per scegliere il punto</span>
          <button type="button" onClick={onAnnullaPick}>
            Annulla
          </button>
        </div>
      )}

      {aperto && !pickMode && (
        <div className="report-overlay" onClick={chiudi}>
          <form className="report-modal" onClick={(e) => e.stopPropagation()} onSubmit={invia}>
            <button type="button" className="report-close" onClick={chiudi} aria-label="Chiudi">
              ×
            </button>
            <h2>Nuova segnalazione</h2>

            {stato === 'ok' ? (
              <>
                <p className="report-ok">Segnalazione inviata. Sarà visibile dopo la verifica dell'operatore.</p>
                <button type="button" className="report-submit" onClick={chiudi}>
                  Chiudi
                </button>
              </>
            ) : (
              <>
                <label>
                  Categoria
                  <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                    {categorie.map((c) => (
                      <option key={c} value={c}>
                        {categoriaLabel[c]}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="report-posizione">
                  <span className="report-pos-label">Posizione</span>
                  {punto ? (
                    <strong>{punto.indirizzo || `${punto.lat.toFixed(5)}, ${punto.lng.toFixed(5)}`}</strong>
                  ) : (
                    <span className="report-pos-vuota">Nessuna posizione scelta</span>
                  )}
                  <div className="report-pos-azioni">
                    <button type="button" onClick={usaGps}>
                      Usa la mia posizione
                    </button>
                    <button type="button" onClick={onAvviaPick}>
                      Scegli sulla mappa
                    </button>
                  </div>
                </div>

                <label>
                  Descrizione (facoltativa)
                  <textarea
                    value={descrizione}
                    onChange={(e) => setDescrizione(e.target.value)}
                    rows={3}
                    maxLength={300}
                  />
                </label>

                {errore && <p className="report-error">{errore}</p>}

                <button type="submit" className="report-submit" disabled={stato === 'loading'}>
                  {stato === 'loading' ? 'Invio…' : 'Invia segnalazione'}
                </button>
              </>
            )}
          </form>
        </div>
      )}
    </>
  );
}

export default ReportControl;
