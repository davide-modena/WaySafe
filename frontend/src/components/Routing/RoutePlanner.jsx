import { useState } from 'react';
import AddressInput from './AddressInput';
import './RoutePlanner.css';

function RoutePlanner({ onPartenza, onDestinazione, pronto }) {
  const [nota, setNota] = useState('');

  return (
    <div className="route-planner">
      <AddressInput placeholder="Partenza" onSelect={onPartenza} />
      <AddressInput placeholder="Destinazione" onSelect={onDestinazione} />
      <button
        type="button"
        className="route-calcola"
        disabled={!pronto}
        onClick={() => setNota('Il calcolo del percorso sicuro/bilanciato sarà disponibile a breve.')}
      >
        Calcola percorso
      </button>
      {nota && <p className="route-nota">{nota}</p>}
    </div>
  );
}

export default RoutePlanner;
