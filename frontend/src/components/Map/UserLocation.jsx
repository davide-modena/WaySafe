import { useEffect, useState } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

const icona = L.divIcon({
  className: 'user-loc',
  html: '<span class="user-loc-dot"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

function UserLocation({ onPosizione, segui }) {
  const map = useMap();
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return undefined;

    const id = navigator.geolocation.watchPosition(
      (p) => {
        const ll = { lat: p.coords.latitude, lng: p.coords.longitude };
        setPos(ll);
        if (onPosizione) onPosizione(ll);
        if (segui) map.setView([ll.lat, ll.lng], Math.max(map.getZoom(), 16));
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, [map, onPosizione, segui]);

  if (!pos) return null;
  return <Marker position={[pos.lat, pos.lng]} icon={icona} interactive={false} zIndexOffset={1000} />;
}

export default UserLocation;
