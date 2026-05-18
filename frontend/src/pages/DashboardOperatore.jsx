import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import HeatmapLayer from '../components/Map/HeatmapLayer';
import ReportMarkers from '../components/Map/ReportMarkers';
import EmergencyButton from '../components/Emergency/EmergencyButton';
import api from '../services/api';
import { categoriaColore } from '../components/Map/reportCategories';
import './DashboardOperatore.css';

const DEFAULT_CENTER = [
  Number(process.env.REACT_APP_DEFAULT_LAT) || 46.0667,
  Number(process.env.REACT_APP_DEFAULT_LNG) || 11.1217
];
const DEFAULT_ZOOM = Number(process.env.REACT_APP_DEFAULT_ZOOM) || 14;

const TILE_ATTR =
  '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const TILE_URL = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';

const STATI_TAB = [
  { value: 'in_attesa', label: 'inAttesa' },
  { value: 'approvata', label: 'approvate' },
  { value: 'rifiutata', label: 'rifiutate' },
];

function CentraMap({ coord }) {
  const map = useMap();
  useEffect(() => {
    if (coord) map.panTo([coord.lat, coord.lng], { animate: true });
  }, [map, coord]);
  return null;
}

function DashboardOperatore() {
  const { t, i18n } = useTranslation();
  const [reports, setReports] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState(false);
  const [inCorso, setInCorso] = useState(null);
  const [centro, setCentro] = useState(null);
  const [filtro, setFiltro] = useState('in_attesa');

  const carica = useCallback((stato) => {
    setCaricamento(true);
    setErrore(false);
    api
      .get('/operator/reports', { params: { stato } })
      .then((res) => {
        setReports(res.data);
        setCaricamento(false);
      })
      .catch(() => {
        setErrore(true);
        setCaricamento(false);
      });
  }, []);

  useEffect(() => {
    carica(filtro);
  }, [filtro, carica]);

  async function aggiorna(id, nuovoStato) {
    setInCorso(id);
    try {
      await api.patch(`/reports/${id}`, { stato: nuovoStato });
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch {}
    setInCorso(null);
  }

  function formatData(d) {
    return new Date(d).toLocaleString(i18n.language, {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className="op-shell">
      <aside className="op-sidebar">
        <div className="op-sidebar-top">
          <div className="op-sidebar-header">
            <h2>{t('operatore.segnalazioni')}</h2>
            <span className="op-count">{reports.length}</span>
          </div>
          <div className="op-tabs">
            {STATI_TAB.map((tab) => (
              <button
                key={tab.value}
                type="button"
                className={filtro === tab.value ? 'op-tab attiva' : 'op-tab'}
                onClick={() => setFiltro(tab.value)}
              >
                {t(`operatore.${tab.label}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="op-lista-wrap">
          {caricamento && <p className="op-info">{t('operatore.caricamento')}</p>}
          {errore && <p className="op-error">{t('operatore.erroreCaricamento')}</p>}
          {!caricamento && !errore && reports.length === 0 && (
            <p className="op-info">{t('operatore.nessuna')}</p>
          )}
          <ul className="op-lista">
            {reports.map((r) => {
              const [lng, lat] = r.posizione.coordinates;
              return (
                <li
                  key={r._id}
                  className="op-card"
                  onClick={() => setCentro({ lat, lng })}
                >
                  <div className="op-card-top">
                    <span
                      className="op-cat"
                      style={{ background: categoriaColore[r.categoria] || categoriaColore.altro }}
                    >
                      {t(`categoria.${r.categoria}`)}
                    </span>
                    <span className="op-data">{formatData(r.createdAt)}</span>
                  </div>
                  {r.descrizione && <p className="op-desc">{r.descrizione}</p>}
                  <p className="op-meta">
                    {r.userId ? `${r.userId.nome} ${r.userId.cognome}` : t('operatore.utente')} ·{' '}
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </p>
                  {filtro === 'in_attesa' && (
                    <div className="op-azioni">
                      <button
                        type="button"
                        className="azione approva"
                        disabled={inCorso === r._id}
                        onClick={(e) => { e.stopPropagation(); aggiorna(r._id, 'approvata'); }}
                      >
                        {t('operatore.approva')}
                      </button>
                      <button
                        type="button"
                        className="azione rifiuta"
                        disabled={inCorso === r._id}
                        onClick={(e) => { e.stopPropagation(); aggiorna(r._id, 'rifiutata'); }}
                      >
                        {t('operatore.rifiuta')}
                      </button>
                      <button
                        type="button"
                        className="azione archivia"
                        disabled={inCorso === r._id}
                        onClick={(e) => { e.stopPropagation(); aggiorna(r._id, 'archiviata'); }}
                      >
                        {t('operatore.archivia')}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <div className="op-mappa">
        <MapContainer
          className="op-map-view"
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom
        >
          <TileLayer attribution={TILE_ATTR} url={TILE_URL} />
          <HeatmapLayer />
          <ReportMarkers />
          {centro && <CentraMap coord={centro} />}
        </MapContainer>
      </div>

      <EmergencyButton />
    </div>
  );
}

export default DashboardOperatore;
