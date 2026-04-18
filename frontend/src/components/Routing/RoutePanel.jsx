import { levelColor, levelLabel } from '../Map/safetyLevels';
import { colorePercorso } from '../Map/RouteDisplay';
import './RoutePanel.css';

const etichetta = { safest: 'Più sicuro', balanced: 'Bilanciato' };

const manovra = {
  depart: 'Parti',
  arrive: 'Arrivo',
  turn: 'Svolta',
  continue: 'Continua',
  'new name': 'Prosegui',
  merge: 'Immettiti',
  fork: 'Tieni',
  'end of road': 'Fine strada',
  roundabout: 'Rotatoria',
  rotary: 'Rotatoria'
};

const direzione = {
  left: 'a sinistra',
  right: 'a destra',
  'slight left': 'leggermente a sinistra',
  'slight right': 'leggermente a destra',
  'sharp left': 'tutto a sinistra',
  'sharp right': 'tutto a destra',
  straight: 'dritto',
  uturn: 'inverti il senso'
};

function formatDistanza(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}

function formatDurata(s) {
  return `${Math.max(1, Math.round(s / 60))} min`;
}

function istruzione(t) {
  const base = manovra[t.manovra] || 'Prosegui';
  const dir = t.direzione && direzione[t.direzione] ? ` ${direzione[t.direzione]}` : '';
  const strada = t.strada ? ` su ${t.strada}` : '';
  return `${base}${dir}${strada}`;
}

function RoutePanel({ percorsi, selezionato, onSeleziona, onChiudi, onSalva, salvato }) {
  if (!percorsi || percorsi.length === 0) return null;
  const attivo = percorsi[selezionato];

  return (
    <div className="route-panel">
      <button type="button" className="route-panel-close" onClick={onChiudi} aria-label="Chiudi">
        ×
      </button>
      <button type="button" className="route-panel-salva" onClick={onSalva} disabled={salvato}>
        {salvato ? '★ Preferito' : '☆ Salva'}
      </button>

      <div className="route-tabs">
        {percorsi.map((p, i) => (
          <button
            key={p.tipo}
            type="button"
            className={i === selezionato ? 'route-tab attiva' : 'route-tab'}
            onClick={() => onSeleziona(i)}
          >
            <span className="route-tab-nome" style={{ color: colorePercorso[p.tipo] }}>
              {etichetta[p.tipo] || p.tipo}
            </span>
            <span className="route-tab-meta">
              {formatDistanza(p.distanceM)} · {formatDurata(p.durationS)}
            </span>
            <span className="route-badge" style={{ background: levelColor[p.safetyLevel] }}>
              {levelLabel[p.safetyLevel]}
            </span>
          </button>
        ))}
      </div>

      <ol className="route-steps">
        {attivo.tappe.map((t, i) => (
          <li key={i}>
            <span className="route-step-testo">{istruzione(t)}</span>
            {t.distanceM > 0 && <span className="route-step-dist">{formatDistanza(t.distanceM)}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default RoutePanel;
