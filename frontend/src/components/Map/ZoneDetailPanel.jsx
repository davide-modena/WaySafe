import { levelColor, levelLabel } from './safetyLevels';
import './ZoneDetailPanel.css';

function ZoneDetailPanel({ zona, onClose }) {
  if (!zona) return null;

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
      </dl>
    </div>
  );
}

export default ZoneDetailPanel;
