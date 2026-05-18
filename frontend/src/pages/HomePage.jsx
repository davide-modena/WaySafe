import { useAuth } from '../context/AuthContext';
import MapView from '../components/Map/MapView';
import DashboardOperatore from './DashboardOperatore';

function HomePage() {
  const { user } = useAuth();
  const operatore = user && (user.ruolo === 'operatore' || user.ruolo === 'admin');

  if (operatore) {
    return <DashboardOperatore />;
  }

  return (
    <main className="home-map">
      <MapView />
    </main>
  );
}

export default HomePage;
