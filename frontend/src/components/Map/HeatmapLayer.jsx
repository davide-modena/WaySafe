import { useEffect, useState, useCallback, useRef } from 'react';
import { GeoJSON, useMapEvents } from 'react-leaflet';
import api from '../../services/api';
import { levelColor } from './safetyLevels';

function weightForZoom(zoom) {
  if (zoom >= 17) return 5;
  if (zoom >= 15) return 3;
  if (zoom >= 13) return 2;
  return 1;
}

function makeStyle(zoom) {
  const weight = weightForZoom(zoom);
  return (feature) => ({
    color: levelColor[feature.properties.safetyLevel] || levelColor.moderate,
    weight,
    opacity: 0.85
  });
}

function HeatmapLayer() {
  const [geojson, setGeojson] = useState(null);
  const [zoom, setZoom] = useState(15);
  const loadingRef = useRef(false);

  const fetchHeatmap = useCallback((bounds) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const bbox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;

    api
      .get('/heatmap', { params: { bbox } })
      .then((res) => setGeojson(res.data))
      .catch(() => setGeojson(null))
      .finally(() => {
        loadingRef.current = false;
      });
  }, []);

  const map = useMapEvents({
    moveend() {
      fetchHeatmap(map.getBounds());
    },
    zoomend() {
      setZoom(map.getZoom());
    }
  });

  useEffect(() => {
    setZoom(map.getZoom());
    fetchHeatmap(map.getBounds());
  }, [map, fetchHeatmap]);

  if (!geojson) return null;

  return (
    <GeoJSON
      key={`${geojson.features.length}-${zoom}`}
      data={geojson}
      style={makeStyle(zoom)}
    />
  );
}

export default HeatmapLayer;
