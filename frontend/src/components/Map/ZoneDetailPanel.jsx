import { useTranslation } from 'react-i18next';
import { levelColor } from './safetyLevels';
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
  const { t, i18n } = useTranslation();
  if (!zona) return null;

  const segnalazioni = zona.segnalazioni || [];
  const { perCategoria, ultimo } = riassumi(segnalazioni);
  const categorie = Object.entries(perCategoria);

  return (
    <div className="zone-panel">
      <button className="zone-panel-close" onClick={onClose} aria-label={t('zona.chiudi')}>
        ×
      </button>
      <span className="zone-panel-level" style={{ background: levelColor[zona.safetyLevel] }}>
        {t(`livello.${zona.safetyLevel}`)}
      </span>
      <h3 className="zone-panel-name">{zona.streetName || t('zona.stradaSenzaNome')}</h3>
      <dl className="zone-panel-data">
        <div>
          <dt>{t('zona.punteggio')}</dt>
          <dd>{zona.safetyScore}/100</dd>
        </div>
        <div>
          <dt>{t('zona.distanza')}</dt>
          <dd>{zona.distanceM} m</dd>
        </div>
        <div>
          <dt>{t('zona.segnalazioniVicine')}</dt>
          <dd>{segnalazioni.length}</dd>
        </div>
      </dl>

      {categorie.length > 0 && (
        <ul className="zone-panel-reports">
          {categorie.map(([cat, n]) => (
            <li key={cat}>
              <span>{t(`categoria.${cat}`)}</span>
              <span className="zone-panel-count">{n}</span>
            </li>
          ))}
        </ul>
      )}

      {ultimo && (
        <p className="zone-panel-updated">
          {t('zona.ultimoAgg', { data: new Date(ultimo).toLocaleDateString(i18n.language) })}
        </p>
      )}
    </div>
  );
}

export default ZoneDetailPanel;
