import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h1>Il mio profilo</h1>
        {user ? (
          <dl className="profile-data">
            <div>
              <dt>Nome</dt>
              <dd>{user.nome}</dd>
            </div>
            <div>
              <dt>Cognome</dt>
              <dd>{user.cognome}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Ruolo</dt>
              <dd>{user.ruolo}</dd>
            </div>
          </dl>
        ) : (
          <p>I dati del profilo non sono disponibili.</p>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
