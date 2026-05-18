import { useTranslation } from 'react-i18next';
import AddressInput from './AddressInput';
import './SearchBar.css';

function SearchBar({ valore, onCerca, onPianifica }) {
  const { t } = useTranslation();
  return (
    <div className="search-bar">
      <div className="search-field">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <AddressInput placeholder={t('search.placeholder')} valore={valore} onSelect={onCerca} />
      </div>
      <button type="button" className="search-pianifica" onClick={onPianifica}>
        {t('search.pianifica')}
      </button>
    </div>
  );
}

export default SearchBar;
