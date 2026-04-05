import { useEffect, useState } from 'react';
import api from '../services/api';
import { categoriaLabel, categoriaColore } from '../components/Map/reportCategories';
import './DashboardOperatore.css';

function formatData(d) {
  return new Date(d).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function DashboardOperatore() {
  const [reports, setReports] = useState([]);
  const [stato, setStato] = useState('loading');
  const [inCorso, setInCorso] = useState(null);

  useEffect(() => {
    api
      .get('/operator/reports', { params: { stato: 'in_attesa' } })
      .then((res) => {
        setReports(res.data);
        setStato('ok');
      })
      .catch(() => setStato('error'));
  }, []);

  async function aggiorna(id, nuovoStato) {
    setInCorso(id);
    try {
      await api.patch(`/reports/${id}`, { stato: nuovoStato });
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch {
      setInCorso(null);
    }
  }

  return (
    <div className="operatore-page">
      <div className="operatore-header">
        <h1>Segnalazioni in attesa</h1>
        <span className="operatore-conteggio">{reports.length}</span>
      </div>

      {stato === 'loading' && <p className="operatore-info">Caricamento…</p>}
      {stato === 'error' && <p className="operatore-error">Impossibile caricare le segnalazioni.</p>}
      {stato === 'ok' && reports.length === 0 && (
        <p className="operatore-info">Nessuna segnalazione da validare.</p>
      )}

      <ul className="operatore-lista">
        {reports.map((r) => {
          const [lng, lat] = r.posizione.coordinates;
          return (
            <li key={r._id} className="operatore-card">
              <div className="operatore-card-top">
                <span
                  className="operatore-categoria"
                  style={{ background: categoriaColore[r.categoria] || categoriaColore.altro }}
                >
                  {categoriaLabel[r.categoria] || r.categoria}
                </span>
                <span className="operatore-data">{formatData(r.createdAt)}</span>
              </div>

              {r.descrizione && <p className="operatore-descrizione">{r.descrizione}</p>}

              <p className="operatore-meta">
                {r.userId ? `${r.userId.nome} ${r.userId.cognome}` : 'Utente'} ·{' '}
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </p>

              <div className="operatore-azioni">
                <button
                  type="button"
                  className="azione approva"
                  disabled={inCorso === r._id}
                  onClick={() => aggiorna(r._id, 'approvata')}
                >
                  Approva
                </button>
                <button
                  type="button"
                  className="azione rifiuta"
                  disabled={inCorso === r._id}
                  onClick={() => aggiorna(r._id, 'rifiutata')}
                >
                  Rifiuta
                </button>
                <button
                  type="button"
                  className="azione archivia"
                  disabled={inCorso === r._id}
                  onClick={() => aggiorna(r._id, 'archiviata')}
                >
                  Archivia
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default DashboardOperatore;
