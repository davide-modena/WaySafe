import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './auth.css';

const formIniziale = { nome: '', cognome: '', email: '', password: '', conferma: '' };

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(formIniziale);
  const [errore, setErrore] = useState('');

  function aggiorna(campo) {
    return (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  }

  function valida() {
    if (!form.nome || !form.cognome || !form.email || !form.password) {
      return 'Compila tutti i campi';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return 'Email non valida';
    }
    if (form.password.length < 6) {
      return 'La password deve avere almeno 6 caratteri';
    }
    if (form.password !== form.conferma) {
      return 'Le password non coincidono';
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
      setErrore((err.response && err.response.data && err.response.data.error) || 'Registrazione non riuscita');
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Registrati</h1>
        {errore && <p className="auth-error">{errore}</p>}
        <label>
          Nome
          <input value={form.nome} onChange={aggiorna('nome')} required />
        </label>
        <label>
          Cognome
          <input value={form.cognome} onChange={aggiorna('cognome')} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={aggiorna('email')} required />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={aggiorna('password')} required />
        </label>
        <label>
          Conferma password
          <input type="password" value={form.conferma} onChange={aggiorna('conferma')} required />
        </label>
        <button type="submit" className="auth-submit">Crea account</button>
        <p className="auth-switch">
          Hai già un account? <Link to="/login">Accedi</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
