import logo from '../../assets/logo-text.png';
import './SplashScreen.css';

function SplashScreen() {
  return (
    <div className="splash-overlay" role="status" aria-label="Caricamento">
      <img src={logo} alt="WaySafe" className="splash-logo" />
    </div>
  );
}

export default SplashScreen;
