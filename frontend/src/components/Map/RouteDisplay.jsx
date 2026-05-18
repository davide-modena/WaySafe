import { useEffect } from 'react';
import { Pane, Polyline, useMap } from 'react-leaflet';

export const coloreSelezionato = '#1a73e8';
export const coloreAlternativo = '#9db8d2';

function toLatLng(geometry) {
  return geometry.coordinates.map(([lng, lat]) => [lat, lng]);
}

function RouteDisplay({ percorsi, selezionato, onSeleziona, soloSelezionato }) {
  const map = useMap();

  useEffect(() => {
    const attivo = percorsi[selezionato];
    if (!attivo) return;
    const coords = toLatLng(attivo.geometry);
    const desktop = window.innerWidth >= 640;
    const opts = desktop
      ? { paddingTopLeft: [360, 60], paddingBottomRight: [60, 60] }
      : { paddingTopLeft: [40, 190], paddingBottomRight: [40, 220] };
    map.fitBounds(coords, opts);
  }, [map, percorsi, selezionato]);

  const elementi = [];

  if (!soloSelezionato) {
    percorsi.forEach((p, i) => {
      if (i === selezionato) return;
      elementi.push(
        <Polyline
          key={`alt-${p.tipo}`}
          positions={toLatLng(p.geometry)}
          pathOptions={{ color: coloreAlternativo, weight: 5, opacity: 0.9 }}
          eventHandlers={{ click: () => onSeleziona(i) }}
        />
      );
    });
  }

  const attivo = percorsi[selezionato];
  if (attivo) {
    elementi.push(
      <Polyline
        key="casing"
        positions={toLatLng(attivo.geometry)}
        pathOptions={{ color: '#ffffff', weight: 10, opacity: 1 }}
        interactive={false}
      />
    );
    elementi.push(
      <Polyline
        key="sel"
        positions={toLatLng(attivo.geometry)}
        pathOptions={{ color: coloreSelezionato, weight: 6, opacity: 1 }}
        eventHandlers={{ click: () => onSeleziona(selezionato) }}
      />
    );
  }

  return (
    <Pane name="routePane" style={{ zIndex: 450 }}>
      {elementi}
    </Pane>
  );
}

export default RouteDisplay;
