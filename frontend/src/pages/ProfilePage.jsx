import { useState, useEffect } from 'react';
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
      .catch(() => setErrore('Impossibile caricare il profilo'));
  }, []);

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
      setMessaggio('Profilo aggiornato con successo');
    } catch (err) {
      setErrore((err.response && err.response.data && err.response.data.error) || 'Errore durante il salvataggio');
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-stack">
      <form className="profile-card" onSubmit={onSubmit}>
        <h1>Il mio profilo</h1>
        {messaggio && <p className="profile-ok">{messaggio}</p>}
        {errore && <p className="profile-error">{errore}</p>}

        <label>
          Nome
          <input value={form.nome} onChange={campo('nome')} />
        </label>
        <label>
          Cognome
          <input value={form.cognome} onChange={campo('cognome')} />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={campo('email')} />
        </label>
        <label>
          Percorso preferito
          <select value={form.percorsoPreferito} onChange={campo('percorsoPreferito')}>
            <option value="piu_sicuro">Più sicuro</option>
            <option value="bilanciato">Bilanciato</option>
          </select>
        </label>
        <label className="profile-check">
          <input
            type="checkbox"
            checked={form.notifiche}
            onChange={(e) => setForm((f) => ({ ...f, notifiche: e.target.checked }))}
          />
          Ricevi notifiche
        </label>
        <label>
          Lingua
          <select value={form.lingua} onChange={campo('lingua')}>
            <option value="it">Italiano</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </label>

        <button type="submit" className="profile-save" disabled={!caricato}>
          Salva modifiche
        </button>
      </form>

      <section className="profile-card">
        <h2 className="profile-sezione">I miei percorsi</h2>

        <div className="percorso-blocco">
          <h3>Percorso preferito</h3>
          {preferito ? (
            <div className="percorso-voce">
              <div className="percorso-info">
                <strong>{preferito.da} → {preferito.a}</strong>
                <span>
                  {preferito.tipo === 'safest' ? 'Più sicuro' : 'Bilanciato'} ·{' '}
                  {(preferito.distanceM / 1000).toFixed(1)} km
                </span>
              </div>
              <button type="button" className="percorso-rimuovi" onClick={eliminaPreferito}>
                Rimuovi
              </button>
            </div>
          ) : (
            <p className="percorso-vuoto">Nessun percorso preferito salvato.</p>
          )}
        </div>

        <div className="percorso-blocco">
          <h3>Cronologia</h3>
          {cronologia.length === 0 ? (
            <p className="percorso-vuoto">Nessun percorso recente.</p>
          ) : (
            <ul className="percorso-lista">
              {cronologia.map((v) => (
                <li key={v.id} className="percorso-voce">
                  <div className="percorso-info">
                    <strong>{v.da} → {v.a}</strong>
                    <span>{new Date(v.quando).toLocaleDateString('it-IT')}</span>
                  </div>
                  <button
                    type="button"
                    className="percorso-rimuovi"
                    onClick={() => eliminaCronologia(v.id)}
                  >
                    Rimuovi
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
