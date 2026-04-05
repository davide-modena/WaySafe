import { useEffect } from 'react';
import { Polyline, useMap } from 'react-leaflet';

export const colorePercorso = { safest: '#16a34a', balanced: '#f97316' };

function toLatLng(geometry) {
  return geometry.coordinates.map(([lng, lat]) => [lat, lng]);
}

function RouteDisplay({ percorsi, selezionato, onSeleziona }) {
  const map = useMap();

  useEffect(() => {
    const attivo = percorsi[selezionato];
    if (attivo) {
      map.fitBounds(toLatLng(attivo.geometry), { padding: [50, 50] });
    }
  }, [map, percorsi, selezionato]);

  return percorsi.map((p, i) => (
    <Polyline
      key={p.tipo}
      positions={toLatLng(p.geometry)}
      pathOptions={{
        color: colorePercorso[p.tipo] || '#16a34a',
        weight: i === selezionato ? 6 : 4,
        opacity: i === selezionato ? 0.9 : 0.4
      }}
      eventHandlers={{ click: () => onSeleziona(i) }}
    />
  ));
}

export default RouteDisplay;
