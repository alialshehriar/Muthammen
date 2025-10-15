import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, Layers, Box, Sun, Moon, Navigation, ZoomIn, ZoomOut, Home } from 'lucide-react';
import accurateSaudiLocations from '../data/accurate_saudi_locations';

// Mapbox Access Token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiYWxpYWxzaGVocmlhciIsImEiOiJjbWdvemtkbzEwOHltMmlxdHh3M3l1cHBhIn0.c-t3RizZIPUwOr3ZTb2Ijw';

const CinematicMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [is3DEnabled, setIs3DEnabled] = useState(true);
  const [mapStyle, setMapStyle] = useState('satellite-streets');
  const [isLoading, setIsLoading] = useState(true);

  // Map styles with HD quality
  const mapStyles = {
    'satellite-streets': 'mapbox://styles/mapbox/satellite-streets-v12',
    'streets': 'mapbox://styles/mapbox/streets-v12',
    'light': 'mapbox://styles/mapbox/light-v11',
    'dark': 'mapbox://styles/mapbox/dark-v11'
  };

  useEffect(() => {
    if (map.current) return;

    // Initialize map with high-quality settings
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyles[mapStyle],
      center: [45.0792, 23.8859], // Saudi Arabia center
      zoom: 5.5,
      pitch: 60, // 3D angle
      bearing: 0,
      antialias: true, // Enable antialiasing for smooth 3D
      maxPitch: 85,
      hash: false,
      preserveDrawingBuffer: true
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true
    }), 'top-left');

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl({
      maxWidth: 100,
      unit: 'metric'
    }), 'bottom-left');

    // Add geolocate control
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    }), 'top-left');

    map.current.on('load', () => {
      setIsLoading(false);

      // Enable 3D terrain with high resolution
      map.current.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });

      map.current.setTerrain({ 
        'source': 'mapbox-dem', 
        'exaggeration': 1.5 // Enhance terrain visibility
      });

      // Add 3D buildings layer with detailed styling
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
        'minzoom': 14,
        'paint': {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['get', 'height'],
            0, '#e3f2fd',
            50, '#90caf9',
            100, '#42a5f5',
            200, '#1976d2'
          ],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14, 0,
            14.5, ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14, 0,
            14.5, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.8,
          'fill-extrusion-vertical-gradient': true
        }
      }, labelLayerId);

      // Add sky layer for realistic atmosphere
      map.current.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 15
        }
      });

      // Add location markers with clustering
      addLocationMarkers();

      // Add smooth animations
      map.current.on('moveend', () => {
        map.current.resize();
      });
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Add location markers with custom styling
  const addLocationMarkers = () => {
    // Add source for locations
    map.current.addSource('locations', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: accurateSaudiLocations.map(loc => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [loc.coordinates[1], loc.coordinates[0]]
          },
          properties: {
            city: loc.city,
            neighborhood: loc.neighborhood,
            price: loc.price,
            trend: loc.trend,
            rating: loc.rating,
            description: loc.description
          }
        }))
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Add cluster circles
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'locations',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#1976d2',
          10,
          '#1565c0',
          30,
          '#0d47a1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          10,
          30,
          30,
          40
        ],
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });

    // Add cluster count labels
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'locations',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 14
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    // Add individual location points
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'locations',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match',
          ['get', 'trend'],
          'صاعد', '#4caf50',
          'مستقر', '#2196f3',
          'هابط', '#f44336',
          '#9e9e9e'
        ],
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
        'circle-opacity': 0.9
      }
    });

    // Add location labels
    map.current.addLayer({
      id: 'location-labels',
      type: 'symbol',
      source: 'locations',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'text-field': ['get', 'neighborhood'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 11,
        'text-offset': [0, 1.5],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#1976d2',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    });

    // Click handlers
    map.current.on('click', 'clusters', (e) => {
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties.cluster_id;
      map.current.getSource('locations').getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err) return;
          map.current.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
            duration: 1000
          });
        }
      );
    });

    map.current.on('click', 'unclustered-point', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const properties = e.features[0].properties;

      // Fly to location with cinematic animation
      map.current.flyTo({
        center: coordinates,
        zoom: 16,
        pitch: 60,
        bearing: 0,
        duration: 2000,
        essential: true
      });

      // Show popup
      new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: '300px',
        className: 'custom-popup'
      })
        .setLngLat(coordinates)
        .setHTML(`
          <div style="padding: 12px; font-family: 'Cairo', sans-serif; direction: rtl;">
            <h3 style="margin: 0 0 8px 0; color: #1976d2; font-size: 16px; font-weight: bold;">
              ${properties.neighborhood}
            </h3>
            <p style="margin: 4px 0; color: #666; font-size: 13px;">
              <strong>المدينة:</strong> ${properties.city}
            </p>
            <p style="margin: 4px 0; color: #1976d2; font-size: 14px; font-weight: bold;">
              <strong>السعر:</strong> ${properties.price} ريال/م²
            </p>
            <p style="margin: 4px 0; color: ${properties.trend === 'صاعد' ? '#4caf50' : properties.trend === 'هابط' ? '#f44336' : '#2196f3'}; font-size: 13px;">
              <strong>الاتجاه:</strong> ${properties.trend}
            </p>
            <p style="margin: 4px 0; color: #ff9800; font-size: 13px;">
              <strong>التقييم:</strong> ${properties.rating} ⭐
            </p>
            <p style="margin: 8px 0 0 0; color: #666; font-size: 12px; line-height: 1.5;">
              ${properties.description}
            </p>
          </div>
        `)
        .addTo(map.current);

      setSelectedLocation(properties);
    });

    // Change cursor on hover
    map.current.on('mouseenter', 'clusters', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'clusters', () => {
      map.current.getCanvas().style.cursor = '';
    });
    map.current.on('mouseenter', 'unclustered-point', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'unclustered-point', () => {
      map.current.getCanvas().style.cursor = '';
    });
  };

  // Toggle 3D mode
  const toggle3D = () => {
    if (!map.current) return;
    
    const newPitch = is3DEnabled ? 0 : 60;
    map.current.easeTo({
      pitch: newPitch,
      duration: 1000
    });
    setIs3DEnabled(!is3DEnabled);
  };

  // Change map style
  const changeMapStyle = (style) => {
    if (!map.current) return;
    
    map.current.setStyle(mapStyles[style]);
    setMapStyle(style);

    // Re-add layers after style change
    map.current.once('styledata', () => {
      if (is3DEnabled) {
        map.current.setTerrain({ 
          'source': 'mapbox-dem', 
          'exaggeration': 1.5 
        });
      }
      addLocationMarkers();
    });
  };

  // Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) return;

    const results = accurateSaudiLocations.filter(loc =>
      loc.city.includes(query) || loc.neighborhood.includes(query)
    );

    if (results.length > 0) {
      const firstResult = results[0];
      map.current.flyTo({
        center: [firstResult.coordinates[1], firstResult.coordinates[0]],
        zoom: 14,
        pitch: 60,
        duration: 2000
      });
    }
  };

  // Quick navigation to major cities
  const flyToCity = (cityName, coords) => {
    map.current.flyTo({
      center: coords,
      zoom: 11,
      pitch: 60,
      bearing: 0,
      duration: 2500,
      essential: true
    });
  };

  return (
    <div className="relative w-full h-screen bg-gray-50" style={{ fontFamily: "'Cairo', 'Noto Sans Arabic', sans-serif" }}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-700 font-semibold">جاري تحميل الخريطة...</p>
          </div>
        </div>
      )}

      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Control panel */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-10" style={{ direction: 'rtl' }}>
        {/* Search bar */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن مدينة أو حي..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-right"
            />
            <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />
          </div>
        </div>

        {/* Quick city navigation */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">المدن الرئيسية</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => flyToCity('الرياض', [46.6753, 24.7136])}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              الرياض
            </button>
            <button
              onClick={() => flyToCity('جدة', [39.1925, 21.5433])}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              جدة
            </button>
            <button
              onClick={() => flyToCity('الدمام', [50.1045, 26.4367])}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              الدمام
            </button>
            <button
              onClick={() => flyToCity('مكة', [39.8262, 21.4225])}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              مكة
            </button>
            <button
              onClick={() => flyToCity('المدينة', [39.6123, 24.4789])}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              المدينة
            </button>
          </div>
        </div>

        {/* Map controls */}
        <div className="space-y-2">
          <button
            onClick={toggle3D}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              is3DEnabled
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Box size={20} />
            <span>{is3DEnabled ? 'إيقاف الوضع ثلاثي الأبعاد' : 'تفعيل الوضع ثلاثي الأبعاد'}</span>
          </button>

          {/* Map style selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => changeMapStyle('satellite-streets')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mapStyle === 'satellite-streets'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              قمر صناعي HD
            </button>
            <button
              onClick={() => changeMapStyle('streets')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mapStyle === 'streets'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              شوارع
            </button>
            <button
              onClick={() => changeMapStyle('light')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mapStyle === 'light'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              فاتح
            </button>
            <button
              onClick={() => changeMapStyle('dark')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mapStyle === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              داكن
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">دليل الألوان</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-gray-600">صاعد</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">مستقر</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-gray-600">هابط</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info panel (if location selected) */}
      {selectedLocation && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-xl p-6 max-w-md z-10" style={{ direction: 'rtl' }}>
          <button
            onClick={() => setSelectedLocation(null)}
            className="absolute top-2 left-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
          <h2 className="text-xl font-bold text-blue-600 mb-2">{selectedLocation.neighborhood}</h2>
          <p className="text-gray-600 mb-4">{selectedLocation.city}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">السعر:</span>
              <span className="font-bold text-blue-600">{selectedLocation.price} ريال/م²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">الاتجاه:</span>
              <span className={`font-medium ${
                selectedLocation.trend === 'صاعد' ? 'text-green-600' :
                selectedLocation.trend === 'هابط' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {selectedLocation.trend}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">التقييم:</span>
              <span className="font-medium text-orange-500">{selectedLocation.rating} ⭐</span>
            </div>
          </div>
          <p className="mt-4 text-gray-600 text-sm leading-relaxed">{selectedLocation.description}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl p-4 z-10" style={{ direction: 'rtl' }}>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">إحصائيات الخريطة</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">المواقع:</span>
            <span className="font-bold text-blue-600">{accurateSaudiLocations.length}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">متوسط السعر:</span>
            <span className="font-bold text-blue-600">
              {Math.round(accurateSaudiLocations.reduce((sum, loc) => sum + loc.price, 0) / accurateSaudiLocations.length)} ريال
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CinematicMap;

