import { useEffect } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

function pinIcon() {
  return L.divIcon({
    className: 'searched-place',
    html: '<span style="position:relative;display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#1a73e8;border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,0.4)"><b style="transform:rotate(45deg);color:#fff;font-size:13px">★</b></span>',
    iconSize: [30, 30],
    iconAnchor: [15, 28]
  });
}

function SearchedPlace({ luogo }) {
  const map = useMap();

  useEffect(() => {
    if (luogo) map.flyTo([luogo.lat, luogo.lng], 16, { duration: 0.8 });
  }, [map, luogo]);

  if (!luogo) return null;

  return (
    <Marker position={[luogo.lat, luogo.lng]} icon={pinIcon()}>
      <Popup>{luogo.label}</Popup>
    </Marker>
  );
}

export default SearchedPlace;
