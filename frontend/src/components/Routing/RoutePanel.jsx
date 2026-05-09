import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { levelColor } from '../Map/safetyLevels';
import { coloreSelezionato, coloreAlternativo } from '../Map/RouteDisplay';
import { istruzione, formatDistanza, formatDurata } from './routeInstructions';
import './RoutePanel.css';

function RoutePanel({ percorsi, selezionato, onSeleziona, onChiudi, onSalva, salvato, onAvvia }) {
  const { t } = useTranslation();
  const [mostraTappe, setMostraTappe] = useState(false);

  if (!percorsi || percorsi.length === 0) return null;
  const attivo = percorsi[selezionato];
  const etichetta = { safest: t('route.piuSicuro'), balanced: t('route.bilanciato') };

  return (
    <div className="route-panel">
      <button type="button" className="route-panel-close" onClick={onChiudi} aria-label={t('route.chiudi')}>
        ×
      </button>
      <button type="button" className="route-panel-salva" onClick={onSalva} disabled={salvato}>
        {salvato ? `★ ${t('route.preferito')}` : `☆ ${t('route.salva')}`}
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
              {t(`livello.${p.safetyLevel}`)}
            </span>
          </button>
        ))}
      </div>

      <button type="button" className="route-avvia" onClick={() => onAvvia(selezionato)}>
        {t('route.avvia')}
      </button>

      <button
        type="button"
        className="route-toggle-tappe"
        onClick={() => setMostraTappe((v) => !v)}
      >
        {mostraTappe
          ? t('route.nascondiIndicazioni')
          : t('route.mostraIndicazioni', { count: attivo.tappe.length })}
      </button>

      {mostraTappe && (
        <ol className="route-steps">
          {attivo.tappe.map((tappa, i) => (
            <li key={i}>
              <span className="route-step-testo">{istruzione(tappa, t)}</span>
              {tappa.distanceM > 0 && (
                <span className="route-step-dist">{formatDistanza(tappa.distanceM)}</span>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default RoutePanel;
