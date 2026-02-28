import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './auth.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

function LoginPage() {
  const { login, loginConToken } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      loginConToken(token);
      navigate('/');
    }
  }, [params, loginConToken, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setErrore('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setErrore((err.response && err.response.data && err.response.data.error) || 'Accesso non riuscito');
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Accedi</h1>
        {errore && <p className="auth-error">{errore}</p>}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" className="auth-submit">Accedi</button>
        <a className="auth-google" href={`${API_URL}/auth/google`}>Accedi con Google</a>
        <p className="auth-switch">
          Non hai un account? <Link to="/register">Registrati</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
