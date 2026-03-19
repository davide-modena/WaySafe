import { useEffect, useState, useCallback, useRef } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../../services/api';
import { categoriaLabel, categoriaColore } from './reportCategories';

function icona(colore) {
  return L.divIcon({
    className: 'report-marker',
    html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${colore};border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,0.35)"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}

function ReportMarkers() {
  const [reports, setReports] = useState([]);
  const loadingRef = useRef(false);

  const fetchReports = useCallback((bounds) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const bbox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;

    api
      .get('/reports', { params: { bbox, stato: 'approvata' } })
      .then((res) => setReports(res.data))
      .catch(() => setReports([]))
      .finally(() => {
        loadingRef.current = false;
      });
  }, []);

  const map = useMapEvents({
    moveend() {
      fetchReports(map.getBounds());
    }
  });

  useEffect(() => {
    fetchReports(map.getBounds());
  }, [map, fetchReports]);

  return reports.map((r) => {
    const [lng, lat] = r.posizione.coordinates;
    return (
      <Marker key={r._id} position={[lat, lng]} icon={icona(categoriaColore[r.categoria] || categoriaColore.altro)}>
        <Popup>
          <strong>{categoriaLabel[r.categoria] || r.categoria}</strong>
          <br />
          {r.descrizione ? (
            <>
              {r.descrizione}
              <br />
            </>
          ) : null}
          Stato: {r.stato}
        </Popup>
      </Marker>
    );
  });
}

export default ReportMarkers;
