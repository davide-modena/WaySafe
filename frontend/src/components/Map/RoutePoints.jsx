import { useEffect } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

function pinIcon(colore, lettera) {
  return L.divIcon({
    className: 'route-point',
    html: `<span style="position:relative;display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${colore};border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,0.4)"><b style="transform:rotate(45deg);color:#fff;font-size:12px;font-weight:700">${lettera}</b></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28]
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
      {partenza && <Marker position={[partenza.lat, partenza.lng]} icon={pinIcon('#1d9e75', 'A')} />}
      {destinazione && <Marker position={[destinazione.lat, destinazione.lng]} icon={pinIcon('#e02424', 'B')} />}
    </>
  );
}

export default RoutePoints;
