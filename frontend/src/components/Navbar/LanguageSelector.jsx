import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const lingue = ['it', 'en', 'de'];

function LanguageSelector() {
  const { i18n, t } = useTranslation();

  function cambia(e) {
    const lng = e.target.value;
    i18n.changeLanguage(lng);
    localStorage.setItem('waysafe_lingua', lng);
  }

  return (
    <select
      className="lang-select"
      value={i18n.language}
      onChange={cambia}
      aria-label={t('lingua')}
    >
      {lingue.map((l) => (
        <option key={l} value={l}>
          {l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}

export default LanguageSelector;
