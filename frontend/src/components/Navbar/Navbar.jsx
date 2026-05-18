import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import NotificationCenter from '../Notifications/NotificationCenter';
import LanguageSelector from './LanguageSelector';
import logoText from '../../assets/logo.png';
import './Navbar.css';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <img src={logoText} alt="WaySafe" className="navbar-logo" />
      </Link>
      <nav className="navbar-links">
        <LanguageSelector />
        {isAuthenticated ? (
          <>
            <NotificationCenter />
            <Link to="/profile" className="navbar-user">
              {user ? user.nome : t('nav.profilo')}
            </Link>
            <button type="button" className="navbar-logout" onClick={onLogout}>
              {t('nav.esci')}
            </button>
          </>
        ) : (
          <>
            <Link to="/login">{t('nav.accedi')}</Link>
            <Link to="/register" className="navbar-cta">
              {t('nav.registrati')}
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
