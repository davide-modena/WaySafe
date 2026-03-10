import { useMapEvents } from 'react-leaflet';
import api from '../../services/api';

function ZoneClickHandler({ onResult, onError }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      api
        .get('/heatmap/point', { params: { lat, lng } })
        .then((res) => onResult(res.data))
        .catch(() => onError());
    }
  });

  return null;
}

export default ZoneClickHandler;
