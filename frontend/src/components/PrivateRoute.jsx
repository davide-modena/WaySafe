import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children, ruoli }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (ruoli && (!user || !ruoli.includes(user.ruolo))) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default PrivateRoute;
