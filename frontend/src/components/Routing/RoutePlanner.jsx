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
  return (
    <div className="route-planner">
      <div className="route-row">
        <AddressInput
          placeholder="Partenza"
          valore={partenza ? partenza.label : ''}
          onSelect={onPartenza}
        />
        <button
          type="button"
          className="route-mypos"
          onClick={onMiaPosizione}
          title="Usa la mia posizione"
          aria-label="Usa la mia posizione"
        >
          ◎
        </button>
      </div>

      <button type="button" className="route-swap" onClick={onSwap} aria-label="Inverti partenza e destinazione">
        ⇅
      </button>

      <AddressInput
        placeholder="Destinazione"
        valore={destinazione ? destinazione.label : ''}
        onSelect={onDestinazione}
      />

      <button
        type="button"
        className="route-calcola"
        disabled={!pronto || stato === 'loading'}
        onClick={onCalcola}
      >
        {stato === 'loading' ? 'Calcolo in corso…' : 'Calcola percorso'}
      </button>
      {stato === 'error' && <p className="route-nota">Impossibile calcolare il percorso. Riprova.</p>}
    </div>
  );
}

export default RoutePlanner;
