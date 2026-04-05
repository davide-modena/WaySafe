import AddressInput from './AddressInput';
import './RoutePlanner.css';

function RoutePlanner({ onPartenza, onDestinazione, pronto, onCalcola, stato }) {
  return (
    <div className="route-planner">
      <AddressInput placeholder="Partenza" onSelect={onPartenza} />
      <AddressInput placeholder="Destinazione" onSelect={onDestinazione} />
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
