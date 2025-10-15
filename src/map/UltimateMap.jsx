import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWxpYWxzaGVocmlhciIsImEiOiJjbWdvemtkbzEwOHltMmlxdHh3M3l1cHBhIn0.c-t3RizZIPUwOr3ZTb2Ijw';

export default function UltimateMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('3d');
  const [selectedCity, setSelectedCity] = useState(null);
  const [stats, setStats] = useState({ total: 0, avgPrice: 0 });

  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [46.7, 24.7],
      zoom: 11,
      pitch: 60,
      bearing: -17.6,
      antialias: true
    });

    map.current.on('load', () => {
      map.current.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });
      map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

      const layers = map.current.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
      ).id;

      map.current.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 13,
        'paint': {
          'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'height'], 0, '#e0e7ff', 50, '#c7d2fe', 100, '#a5b4fc', 200, '#818cf8'],
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 13, 0, 13.05, ['get', 'height']],
          'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 13, 0, 13.05, ['get', 'min_height']],
          'fill-extrusion-opacity': 0.8
        }
      }, labelLayerId);

      map.current.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15
        }
      });

      loadLocationsAndMarkers();
      setLoading(false);
    });

    map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'bottom-left');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'bottom-left');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const loadLocationsAndMarkers = async () => {
    const module = await import('../data/saudi_locations.js');
    const locations = module.saudiLocations;
    setStats({ total: locations.length, avgPrice: Math.round(locations.reduce((s, l) => s + l.price, 0) / locations.length) });

    const geojson = {
      type: 'FeatureCollection',
      features: locations.map(loc => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: loc.coords },
        properties: { ...loc }
      }))
    };

    map.current.addSource('locations', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'locations',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': ['step', ['get', 'point_count'], '#667eea', 10, '#764ba2', 30, '#f093fb'],
        'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });

    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'locations',
      filter: ['has', 'point_count'],
      layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 14 },
      paint: { 'text-color': '#ffffff' }
    });

    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'locations',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': ['match', ['get', 'trend'], 'صاعد', '#10b981', 'مستقر', '#667eea', 'هابط', '#ef4444', '#667eea'],
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 6, 15, 12],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });

    setupInteractions();
  };

  const setupInteractions = () => {
    map.current.on('click', 'unclustered-point', (e) => {
      const props = e.features[0].properties;
      map.current.flyTo({ center: e.features[0].geometry.coordinates, zoom: 16, pitch: 70, duration: 2500 });
      setSelectedCity(props);
    });

    ['clusters', 'unclustered-point'].forEach(layer => {
      map.current.on('mouseenter', layer, () => map.current.getCanvas().style.cursor = 'pointer');
      map.current.on('mouseleave', layer, () => map.current.getCanvas().style.cursor = '');
    });
  };

  const changeViewMode = (mode) => {
    setViewMode(mode);
    const styles = { '3d': 'mapbox://styles/mapbox/light-v11', 'satellite': 'mapbox://styles/mapbox/satellite-streets-v12', 'dark': 'mapbox://styles/mapbox/dark-v11' };
    map.current.setStyle(styles[mode]);
    map.current.once('style.load', () => loadLocationsAndMarkers());
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold">جاري تحميل الخريطة...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute inset-0" />
      
      <div className="absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-lg z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">م</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">خريطة مُثمّن التفاعلية</h1>
                <p className="text-sm text-gray-500">{stats.total} موقع • متوسط {stats.avgPrice.toLocaleString()} ر.س/م²</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[['3d', '🏙️ ثلاثي الأبعاد'], ['satellite', '🛰️ قمر صناعي'], ['dark', '🌙 ليلي']].map(([mode, label]) => (
                <button key={mode} onClick={() => changeViewMode(mode)} className={`px-5 py-2.5 rounded-xl font-bold ${viewMode === mode ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white text-gray-700'}`}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-5 z-10">
        <h3 className="font-bold mb-4 text-right">دليل الألوان</h3>
        {[['صاعد', 'bg-green-500'], ['مستقر', 'bg-blue-500'], ['هابط', 'bg-red-500']].map(([label, color]) => (
          <div key={label} className="flex items-center gap-3 justify-end mb-2">
            <span>{label}</span>
            <div className={`w-5 h-5 rounded-full ${color}`}></div>
          </div>
        ))}
      </div>

      {selectedCity && (
        <div className="absolute top-24 left-6 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl z-10 w-96 p-6">
          <button onClick={() => setSelectedCity(null)} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gray-100">✕</button>
          <div className="text-right">
            <h2 className="text-2xl font-bold mb-1">{selectedCity.district}</h2>
            <p className="text-gray-500 mb-4">{selectedCity.city}</p>
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6 rounded-xl text-center">
              <p className="text-4xl font-bold">{selectedCity.price.toLocaleString()}</p>
              <p className="text-sm">ريال سعودي / م²</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
