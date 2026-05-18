import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SplashProvider, useSplash } from './context/SplashContext';
import Navbar from './components/Navbar/Navbar';
import PrivateRoute from './components/PrivateRoute';
import SplashScreen from './components/Splash/SplashScreen';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

const PAGINE_SENZA_SPLASH = ['/login', '/register', '/profile'];

function AppInner() {
  const { visibile, nascondi } = useSplash();
  const { pathname } = useLocation();

  useEffect(() => {
    if (PAGINE_SENZA_SPLASH.includes(pathname)) nascondi();
  }, [pathname, nascondi]);

  return (
    <div className="app-shell">
      {visibile && <SplashScreen />}
      <Navbar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SplashProvider>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </SplashProvider>
    </AuthProvider>
  );
}

export default App;
