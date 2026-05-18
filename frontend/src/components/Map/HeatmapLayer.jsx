import { useEffect, useState, useCallback, useRef } from 'react';
import { GeoJSON, useMapEvents } from 'react-leaflet';
import api from '../../services/api';
import { levelColor } from './safetyLevels';
import { useSplash } from '../../context/SplashContext';

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
  const primaFetchRef = useRef(true);
  const startTimeRef = useRef(Date.now());
  const { nascondi } = useSplash();

  const nascondiSplash = useCallback(() => {
    if (!primaFetchRef.current) return;
    primaFetchRef.current = false;
    const elapsed = Date.now() - startTimeRef.current;
    const rimanente = Math.max(0, 800 - elapsed);
    setTimeout(nascondi, rimanente);
  }, [nascondi]);

  useEffect(() => {
    if (geojson !== null) nascondiSplash();
  }, [geojson, nascondiSplash]);

  const fetchHeatmap = useCallback((bounds) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const bbox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;

    api
      .get('/heatmap', { params: { bbox } })
      .then((res) => setGeojson(res.data))
      .catch(() => nascondiSplash())
      .finally(() => {
        loadingRef.current = false;
      });
  }, [nascondiSplash]);

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
