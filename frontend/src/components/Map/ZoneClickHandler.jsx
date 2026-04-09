import { useMapEvents } from 'react-leaflet';
import api from '../../services/api';

function ZoneClickHandler({ onResult, onError }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const d = 0.0012;
      const bbox = `${lat - d},${lng - d},${lat + d},${lng + d}`;

      Promise.all([
        api.get('/heatmap/point', { params: { lat, lng } }),
        api.get('/reports', { params: { bbox, stato: 'approvata' } })
      ])
        .then(([zona, reports]) => onResult({ ...zona.data, segnalazioni: reports.data }))
        .catch(() => onError());
    }
  });

  return null;
}

export default ZoneClickHandler;
