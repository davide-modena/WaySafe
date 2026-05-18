import { useTranslation } from 'react-i18next';
import AddressInput from './AddressInput';
import './RoutePlanner.css';

function RoutePlanner({
  partenza,
  destinazione,
  onPartenza,
  onDestinazione,
  onSwap,
  onMiaPosizione,
  pronto,
  onCalcola,
  stato
}) {
  const { t } = useTranslation();
  return (
    <div className="route-planner">
      <div className="route-row">
        <AddressInput
          placeholder={t('planner.partenza')}
          valore={partenza ? partenza.label : ''}
          onSelect={onPartenza}
        />
        <button
          type="button"
          className="route-mypos"
          onClick={onMiaPosizione}
          title={t('planner.miaPosizione')}
          aria-label={t('planner.miaPosizione')}
        >
          ◎
        </button>
      </div>

      <button type="button" className="route-swap" onClick={onSwap} aria-label={t('planner.inverti')}>
        ⇅
      </button>

      <AddressInput
        placeholder={t('planner.destinazione')}
        valore={destinazione ? destinazione.label : ''}
        onSelect={onDestinazione}
      />

      <button
        type="button"
        className="route-calcola"
        disabled={!pronto || stato === 'loading'}
        onClick={onCalcola}
      >
        {stato === 'loading' ? t('planner.calcolando') : t('planner.calcola')}
      </button>
      {stato === 'error' && <p className="route-nota">{t('planner.errore')}</p>}
    </div>
  );
}

export default RoutePlanner;
