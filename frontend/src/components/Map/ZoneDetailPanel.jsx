import { levelColor, levelLabel } from './safetyLevels';
import { categoriaLabel } from './reportCategories';
import './ZoneDetailPanel.css';

function riassumi(segnalazioni) {
  const perCategoria = {};
  let ultimo = null;
  for (const s of segnalazioni) {
    perCategoria[s.categoria] = (perCategoria[s.categoria] || 0) + 1;
    if (!ultimo || new Date(s.createdAt) > new Date(ultimo)) ultimo = s.createdAt;
  }
  return { perCategoria, ultimo };
}

function ZoneDetailPanel({ zona, onClose }) {
  if (!zona) return null;

  const segnalazioni = zona.segnalazioni || [];
  const { perCategoria, ultimo } = riassumi(segnalazioni);
  const categorie = Object.entries(perCategoria);

  return (
    <div className="zone-panel">
      <button className="zone-panel-close" onClick={onClose} aria-label="Chiudi">
        ×
      </button>
      <span className="zone-panel-level" style={{ background: levelColor[zona.safetyLevel] }}>
        {levelLabel[zona.safetyLevel]}
      </span>
      <h3 className="zone-panel-name">{zona.streetName || 'Strada senza nome'}</h3>
      <dl className="zone-panel-data">
        <div>
          <dt>Punteggio sicurezza</dt>
          <dd>{zona.safetyScore}/100</dd>
        </div>
        <div>
          <dt>Distanza dal punto</dt>
          <dd>{zona.distanceM} m</dd>
        </div>
        <div>
          <dt>Segnalazioni vicine</dt>
          <dd>{segnalazioni.length}</dd>
        </div>
      </dl>

      {categorie.length > 0 && (
        <ul className="zone-panel-reports">
          {categorie.map(([cat, n]) => (
            <li key={cat}>
              <span>{categoriaLabel[cat] || cat}</span>
              <span className="zone-panel-count">{n}</span>
            </li>
          ))}
        </ul>
      )}

      {ultimo && (
        <p className="zone-panel-updated">
          Ultimo aggiornamento: {new Date(ultimo).toLocaleDateString('it-IT')}
        </p>
      )}
    </div>
  );
}

export default ZoneDetailPanel;
