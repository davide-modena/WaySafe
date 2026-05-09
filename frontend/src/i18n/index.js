import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import it from './it.json';
import en from './en.json';
import de from './de.json';

const salvata = localStorage.getItem('waysafe_lingua');

i18n.use(initReactI18next).init({
  resources: {
    it: { translation: it },
    en: { translation: en },
    de: { translation: de }
  },
  lng: salvata || 'it',
  fallbackLng: 'it',
  interpolation: { escapeValue: false }
});

export default i18n;
