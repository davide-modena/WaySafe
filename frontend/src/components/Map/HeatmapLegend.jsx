import { levelColor, levelLabel } from './safetyLevels';
import './HeatmapLegend.css';

const ordine = ['safe', 'moderate', 'risk', 'danger'];

function HeatmapLegend() {
  return (
    <div className="heatmap-legend">
      <span className="heatmap-legend-title">Sicurezza strade</span>
      {ordine.map((livello) => (
        <div key={livello} className="heatmap-legend-row">
          <span className="heatmap-legend-swatch" style={{ background: levelColor[livello] }} />
          {levelLabel[livello]}
        </div>
      ))}
    </div>
  );
}

export default HeatmapLegend;
