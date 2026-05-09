import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  getCronologia,
  rimuoviCronologia,
  getPreferito,
  rimuoviPreferito
} from '../services/savedRoutes';
import './ProfilePage.css';

const formIniziale = {
  nome: '',
  cognome: '',
  email: '',
  percorsoPreferito: 'piu_sicuro',
  notifiche: true,
  lingua: 'it'
};

function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { updateUser } = useAuth();
  const [form, setForm] = useState(formIniziale);
  const [caricato, setCaricato] = useState(false);
  const [messaggio, setMessaggio] = useState('');
  const [errore, setErrore] = useState('');
  const [preferito, setPreferito] = useState(getPreferito());
  const [cronologia, setCronologia] = useState(getCronologia());

  function eliminaPreferito() {
    rimuoviPreferito();
    setPreferito(null);
  }

  function eliminaCronologia(id) {
    rimuoviCronologia(id);
    setCronologia(getCronologia());
  }

  useEffect(() => {
    api
      .get('/users/me')
      .then(({ data }) => {
        setForm({
          nome: data.nome || '',
          cognome: data.cognome || '',
          email: data.email || '',
          percorsoPreferito: data.percorsoPreferito || 'piu_sicuro',
          notifiche: data.notifiche !== false,
          lingua: data.lingua || 'it'
        });
        setCaricato(true);
      })
      .catch(() => setErrore(t('profilo.erroreCaricamento')));
  }, [t]);

  function campo(nome) {
    return (e) => setForm((f) => ({ ...f, [nome]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMessaggio('');
    setErrore('');
    try {
      const { data } = await api.patch('/users/me', form);
      updateUser(data);
      if (form.lingua && form.lingua !== i18n.language) {
        i18n.changeLanguage(form.lingua);
        localStorage.setItem('waysafe_lingua', form.lingua);
      }
      setMessaggio(t('profilo.aggiornato'));
    } catch (err) {
      setErrore((err.response && err.response.data && err.response.data.error) || t('profilo.erroreSalvataggio'));
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-stack">
      <form className="profile-card" onSubmit={onSubmit}>
        <h1>{t('profilo.titolo')}</h1>
        {messaggio && <p className="profile-ok">{messaggio}</p>}
        {errore && <p className="profile-error" role="alert">{errore}</p>}

        <label>
          {t('profilo.nome')}
          <input value={form.nome} onChange={campo('nome')} />
        </label>
        <label>
          {t('profilo.cognome')}
          <input value={form.cognome} onChange={campo('cognome')} />
        </label>
        <label>
          {t('profilo.email')}
          <input type="email" value={form.email} onChange={campo('email')} />
        </label>
        <label>
          {t('profilo.percorsoPreferito')}
          <select value={form.percorsoPreferito} onChange={campo('percorsoPreferito')}>
            <option value="piu_sicuro">{t('profilo.piuSicuro')}</option>
            <option value="bilanciato">{t('profilo.bilanciato')}</option>
          </select>
        </label>
        <label className="profile-check">
          <input
            type="checkbox"
            checked={form.notifiche}
            onChange={(e) => setForm((f) => ({ ...f, notifiche: e.target.checked }))}
          />
          {t('profilo.riceviNotifiche')}
        </label>
        <label>
          {t('profilo.lingua')}
          <select value={form.lingua} onChange={campo('lingua')}>
            <option value="it">Italiano</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </label>

        <button type="submit" className="profile-save" disabled={!caricato}>
          {t('profilo.salva')}
        </button>
      </form>

      <section className="profile-card">
        <h2 className="profile-sezione">{t('profilo.mieiPercorsi')}</h2>

        <div className="percorso-blocco">
          <h3>{t('profilo.percorsoPreferito')}</h3>
          {preferito ? (
            <div className="percorso-voce">
              <div className="percorso-info">
                <strong>{preferito.da} → {preferito.a}</strong>
                <span>
                  {preferito.tipo === 'safest' ? t('profilo.piuSicuro') : t('profilo.bilanciato')} ·{' '}
                  {(preferito.distanceM / 1000).toFixed(1)} km
                </span>
              </div>
              <button type="button" className="percorso-rimuovi" onClick={eliminaPreferito}>
                {t('profilo.rimuovi')}
              </button>
            </div>
          ) : (
            <p className="percorso-vuoto">{t('profilo.nessunPreferito')}</p>
          )}
        </div>

        <div className="percorso-blocco">
          <h3>{t('profilo.cronologia')}</h3>
          {cronologia.length === 0 ? (
            <p className="percorso-vuoto">{t('profilo.nessunRecente')}</p>
          ) : (
            <ul className="percorso-lista">
              {cronologia.map((v) => (
                <li key={v.id} className="percorso-voce">
                  <div className="percorso-info">
                    <strong>{v.da} → {v.a}</strong>
                    <span>{new Date(v.quando).toLocaleDateString(i18n.language)}</span>
                  </div>
                  <button
                    type="button"
                    className="percorso-rimuovi"
                    onClick={() => eliminaCronologia(v.id)}
                  >
                    {t('profilo.rimuovi')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      </div>
    </div>
  );
}

export default ProfilePage;
