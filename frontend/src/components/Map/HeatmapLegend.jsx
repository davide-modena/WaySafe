import { useTranslation } from 'react-i18next';
import { levelColor } from './safetyLevels';
import './HeatmapLegend.css';

const ordine = ['safe', 'moderate', 'risk', 'danger'];

function HeatmapLegend() {
  const { t } = useTranslation();
  return (
    <div className="heatmap-legend">
      <span className="heatmap-legend-title">{t('legenda.titolo')}</span>
      {ordine.map((livello) => (
        <div key={livello} className="heatmap-legend-row">
          <span className="heatmap-legend-swatch" style={{ background: levelColor[livello] }} />
          {t(`livello.${livello}`)}
        </div>
      ))}
    </div>
  );
}

export default HeatmapLegend;
