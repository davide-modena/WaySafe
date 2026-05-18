import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './auth.css';

const formIniziale = { nome: '', cognome: '', email: '', password: '', conferma: '' };

function RegisterPage() {
  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState(formIniziale);
  const [errore, setErrore] = useState('');

  function aggiorna(campo) {
    return (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  }

  function valida() {
    if (!form.nome || !form.cognome || !form.email || !form.password) {
      return t('register.compila');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return t('register.emailNonValida');
    }
    if (form.password.length < 6) {
      return t('register.passwordCorta');
    }
    if (form.password !== form.conferma) {
      return t('register.passwordDiverse');
    }
    return '';
  }

  async function onSubmit(e) {
    e.preventDefault();
    const msg = valida();
    if (msg) {
      setErrore(msg);
      return;
    }
    setErrore('');
    try {
      await register({
        nome: form.nome,
        cognome: form.cognome,
        email: form.email,
        password: form.password
      });
      navigate('/');
    } catch (err) {
      setErrore((err.response && err.response.data && err.response.data.error) || t('register.errore'));
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>{t('register.titolo')}</h1>
        {errore && <p className="auth-error" role="alert">{errore}</p>}
        <label>
          {t('register.nome')}
          <input value={form.nome} onChange={aggiorna('nome')} required />
        </label>
        <label>
          {t('register.cognome')}
          <input value={form.cognome} onChange={aggiorna('cognome')} required />
        </label>
        <label>
          {t('register.email')}
          <input type="email" value={form.email} onChange={aggiorna('email')} required />
        </label>
        <label>
          {t('register.password')}
          <input type="password" value={form.password} onChange={aggiorna('password')} required />
        </label>
        <label>
          {t('register.conferma')}
          <input type="password" value={form.conferma} onChange={aggiorna('conferma')} required />
        </label>
        <button type="submit" className="auth-submit">{t('register.submit')}</button>
        <p className="auth-switch">
          {t('register.haiAccount')} <Link to="/login">{t('nav.accedi')}</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
