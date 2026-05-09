import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { reverseGeocode } from '../../services/geocode';
import './ReportControl.css';

const categorie = ['scarsa_illuminazione', 'comportamenti_sospetti', 'strade_danneggiate', 'altro'];

function ReportControl({ punto, pickMode, onAvviaPick, onAnnullaPick, onSetPunto, onReset }) {
  const { t } = useTranslation();
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

  useEffect(() => {
    if (!aperto) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') chiudi();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [aperto]);

  function usaGps() {
    setErrore('');
    if (!navigator.geolocation) {
      setErrore(t('segnalazione.geoNonDisp'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const indirizzo = await reverseGeocode(latitude, longitude);
        onSetPunto({ lat: latitude, lng: longitude, indirizzo });
      },
      () => setErrore(t('segnalazione.posNonRilevata')),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function invia(e) {
    e.preventDefault();
    if (!isAuthenticated) {
      setErrore(t('segnalazione.nonAutenticato'));
      return;
    }
    if (!punto) {
      setErrore(t('segnalazione.scegliPosizione'));
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
      setErrore((err.response && err.response.data && err.response.data.error) || t('segnalazione.erroreInvio'));
    }
  }

  return (
    <>
      <button type="button" className="report-fab" onClick={apri} aria-label={t('segnalazione.fab')}>
        +
      </button>

      {aperto && pickMode && (
        <div className="report-pick">
          <span>{t('segnalazione.toccaMappa')}</span>
          <button type="button" onClick={onAnnullaPick}>
            {t('segnalazione.annulla')}
          </button>
        </div>
      )}

      {aperto && !pickMode && (
        <div className="report-overlay" onClick={chiudi}>
          <form
            className="report-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={invia}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-titolo"
          >
            <button type="button" className="report-close" onClick={chiudi} aria-label={t('segnalazione.chiudi')}>
              ×
            </button>
            <h2 id="report-titolo">{t('segnalazione.nuova')}</h2>

            {stato === 'ok' ? (
              <>
                <p className="report-ok">{t('segnalazione.inviata')}</p>
                <button type="button" className="report-submit" onClick={chiudi}>
                  {t('segnalazione.chiudi')}
                </button>
              </>
            ) : (
              <>
                <label>
                  {t('segnalazione.categoria')}
                  <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                    {categorie.map((c) => (
                      <option key={c} value={c}>
                        {t(`categoria.${c}`)}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="report-posizione">
                  <span className="report-pos-label">{t('segnalazione.posizione')}</span>
                  {punto ? (
                    <strong>{punto.indirizzo || `${punto.lat.toFixed(5)}, ${punto.lng.toFixed(5)}`}</strong>
                  ) : (
                    <span className="report-pos-vuota">{t('segnalazione.nessunaPosizione')}</span>
                  )}
                  <div className="report-pos-azioni">
                    <button type="button" onClick={usaGps}>
                      {t('segnalazione.usaPosizione')}
                    </button>
                    <button type="button" onClick={onAvviaPick}>
                      {t('segnalazione.scegliMappa')}
                    </button>
                  </div>
                </div>

                <label>
                  {t('segnalazione.descrizione')}
                  <textarea
                    value={descrizione}
                    onChange={(e) => setDescrizione(e.target.value)}
                    rows={3}
                    maxLength={300}
                  />
                </label>

                {errore && <p className="report-error" role="alert">{errore}</p>}

                <button type="submit" className="report-submit" disabled={stato === 'loading'}>
                  {stato === 'loading' ? t('segnalazione.invio') : t('segnalazione.invia')}
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
