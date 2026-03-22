import { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';
import HeatmapLegend from './HeatmapLegend';
import ReportMarkers from './ReportMarkers';
import ZoneClickHandler from './ZoneClickHandler';
import ZoneDetailPanel from './ZoneDetailPanel';
import EmergencyButton from '../Emergency/EmergencyButton';
import './MapView.css';

const DEFAULT_CENTER = [
  Number(process.env.REACT_APP_DEFAULT_LAT) || 46.0667,
  Number(process.env.REACT_APP_DEFAULT_LNG) || 11.1217
];
const DEFAULT_ZOOM = Number(process.env.REACT_APP_DEFAULT_ZOOM) || 14;

const TILE_ATTR =
  '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const TILE_GIORNO = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';
const TILE_NOTTE = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';

function isNotte() {
  const ora = new Date().getHours();
  return ora >= 18 || ora < 6;
}

function MapView({ children }) {
  const [zona, setZona] = useState(null);
  const [notte, setNotte] = useState(isNotte());

  useEffect(() => {
    const id = setInterval(() => setNotte(isNotte()), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="map-shell">
      <MapContainer
        className="map-view"
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
      >
        <TileLayer key={notte ? 'notte' : 'giorno'} attribution={TILE_ATTR} url={notte ? TILE_NOTTE : TILE_GIORNO} />
        <HeatmapLayer />
        <ReportMarkers />
        <ZoneClickHandler onResult={setZona} onError={() => setZona(null)} />
        {children}
      </MapContainer>
      <HeatmapLegend />
      <ZoneDetailPanel zona={zona} onClose={() => setZona(null)} />
      <EmergencyButton />
    </div>
  );
}

export default MapView;
