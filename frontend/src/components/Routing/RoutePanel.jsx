import { useState } from 'react';
import { levelColor, levelLabel } from '../Map/safetyLevels';
import { coloreSelezionato, coloreAlternativo } from '../Map/RouteDisplay';
import { istruzione, formatDistanza, formatDurata } from './routeInstructions';
import './RoutePanel.css';

const etichetta = { safest: 'Più sicuro', balanced: 'Bilanciato' };

function RoutePanel({ percorsi, selezionato, onSeleziona, onChiudi, onSalva, salvato, onAvvia }) {
  const [mostraTappe, setMostraTappe] = useState(false);

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
            <span
              className="route-tab-nome"
              style={{ color: i === selezionato ? coloreSelezionato : coloreAlternativo }}
            >
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

      <button type="button" className="route-avvia" onClick={() => onAvvia(selezionato)}>
        Avvia
      </button>

      <button
        type="button"
        className="route-toggle-tappe"
        onClick={() => setMostraTappe((v) => !v)}
      >
        {mostraTappe ? 'Nascondi indicazioni' : `Mostra indicazioni (${attivo.tappe.length})`}
      </button>

      {mostraTappe && (
        <ol className="route-steps">
          {attivo.tappe.map((t, i) => (
            <li key={i}>
              <span className="route-step-testo">{istruzione(t)}</span>
              {t.distanceM > 0 && <span className="route-step-dist">{formatDistanza(t.distanceM)}</span>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default RoutePanel;
