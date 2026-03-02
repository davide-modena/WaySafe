import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        WaySafe
      </Link>
      <nav className="navbar-links">
        {isAuthenticated ? (
          <>
            <span className="navbar-user">{user ? user.nome : 'Account'}</span>
            <button type="button" className="navbar-logout" onClick={onLogout}>
              Esci
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Accedi</Link>
            <Link to="/register" className="navbar-cta">
              Registrati
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
