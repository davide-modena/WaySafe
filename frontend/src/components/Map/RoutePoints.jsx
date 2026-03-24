import { useEffect } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

function puntoIcon(colore) {
  return L.divIcon({
    className: 'route-point',
    html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:${colore};border:3px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,0.35)"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

function RoutePoints({ partenza, destinazione }) {
  const map = useMap();

  useEffect(() => {
    if (partenza && destinazione) {
      map.fitBounds(
        [
          [partenza.lat, partenza.lng],
          [destinazione.lat, destinazione.lng]
        ],
        { padding: [60, 60] }
      );
    } else if (partenza) {
      map.setView([partenza.lat, partenza.lng], 15);
    } else if (destinazione) {
      map.setView([destinazione.lat, destinazione.lng], 15);
    }
  }, [map, partenza, destinazione]);

  return (
    <>
      {partenza && <Marker position={[partenza.lat, partenza.lng]} icon={puntoIcon('#1d9e75')} />}
      {destinazione && <Marker position={[destinazione.lat, destinazione.lng]} icon={puntoIcon('#e02424')} />}
    </>
  );
}

export default RoutePoints;
