import AddressInput from './AddressInput';
import './SearchBar.css';

function SearchBar({ valore, onCerca, onPianifica }) {
  return (
    <div className="search-bar">
      <div className="search-field">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <AddressInput placeholder="Cerca un luogo a Trento" valore={valore} onSelect={onCerca} />
      </div>
      <button type="button" className="search-pianifica" onClick={onPianifica}>
        Pianifica percorso
      </button>
    </div>
  );
}

export default SearchBar;
