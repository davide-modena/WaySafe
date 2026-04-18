import { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';
import HeatmapLegend from './HeatmapLegend';
import ReportMarkers from './ReportMarkers';
import RoutePoints from './RoutePoints';
import ZoneClickHandler from './ZoneClickHandler';
import ZoneDetailPanel from './ZoneDetailPanel';
import ReportPickHandler from './ReportPickHandler';
import RouteDisplay from './RouteDisplay';
import EmergencyButton from '../Emergency/EmergencyButton';
import ReportControl from '../Reports/ReportControl';
import RoutePlanner from '../Routing/RoutePlanner';
import RoutePanel from '../Routing/RoutePanel';
import useRouting from '../../hooks/useRouting';
import { reverseGeocode } from '../../services/geocode';
import { aggiungiCronologia, setPreferito } from '../../services/savedRoutes';
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
  const [partenza, setPartenza] = useState(null);
  const [destinazione, setDestinazione] = useState(null);
  const [pickMode, setPickMode] = useState(false);
  const [reportPunto, setReportPunto] = useState(null);
  const [preferitoSalvato, setPreferitoSalvato] = useState(false);
  const { percorsi, selezionato, stato: routeStato, calcola, seleziona, reset } = useRouting();

  useEffect(() => {
    const id = setInterval(() => setNotte(isNotte()), 60000);
    return () => clearInterval(id);
  }, []);

  function etichettaPunto(p) {
    return p.label || `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`;
  }

  function avviaCalcolo() {
    if (!partenza || !destinazione) return;
    setPreferitoSalvato(false);
    aggiungiCronologia({
      id: String(Date.now()),
      da: etichettaPunto(partenza),
      a: etichettaPunto(destinazione),
      daCoord: { lat: partenza.lat, lng: partenza.lng },
      aCoord: { lat: destinazione.lat, lng: destinazione.lng },
      quando: Date.now()
    });
    calcola(partenza, destinazione);
  }

  function salvaPreferito() {
    if (!partenza || !destinazione || percorsi.length === 0) return;
    const p = percorsi[selezionato];
    setPreferito({
      id: String(Date.now()),
      da: etichettaPunto(partenza),
      a: etichettaPunto(destinazione),
      daCoord: { lat: partenza.lat, lng: partenza.lng },
      aCoord: { lat: destinazione.lat, lng: destinazione.lng },
      tipo: p.tipo,
      distanceM: p.distanceM,
      safetyLevel: p.safetyLevel,
      quando: Date.now()
    });
    setPreferitoSalvato(true);
  }

  function chiudiPercorso() {
    reset();
    setPreferitoSalvato(false);
  }

  async function scegliPunto(latlng) {
    setPickMode(false);
    setReportPunto({ lat: latlng.lat, lng: latlng.lng, indirizzo: null });
    const indirizzo = await reverseGeocode(latlng.lat, latlng.lng);
    setReportPunto({ lat: latlng.lat, lng: latlng.lng, indirizzo });
  }

  function resetReport() {
    setPickMode(false);
    setReportPunto(null);
  }

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
        <RoutePoints partenza={partenza} destinazione={destinazione} />
        {percorsi.length > 0 && (
          <RouteDisplay percorsi={percorsi} selezionato={selezionato} onSeleziona={seleziona} />
        )}
        {pickMode ? (
          <ReportPickHandler onPick={scegliPunto} />
        ) : (
          <ZoneClickHandler onResult={setZona} onError={() => setZona(null)} />
        )}
        {children}
      </MapContainer>
      <RoutePlanner
        onPartenza={setPartenza}
        onDestinazione={setDestinazione}
        pronto={Boolean(partenza && destinazione)}
        onCalcola={avviaCalcolo}
        stato={routeStato}
      />
      <RoutePanel
        percorsi={percorsi}
        selezionato={selezionato}
        onSeleziona={seleziona}
        onSalva={salvaPreferito}
        salvato={preferitoSalvato}
        onChiudi={chiudiPercorso}
      />
      <HeatmapLegend />
      <ZoneDetailPanel zona={zona} onClose={() => setZona(null)} />
      <ReportControl
        punto={reportPunto}
        pickMode={pickMode}
        onAvviaPick={() => setPickMode(true)}
        onAnnullaPick={() => setPickMode(false)}
        onSetPunto={setReportPunto}
        onReset={resetReport}
      />
      <EmergencyButton />
    </div>
  );
}

export default MapView;
