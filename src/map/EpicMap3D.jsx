import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, Navigation, ZoomIn, ZoomOut, Home, Layers } from 'lucide-react';
import accurateSaudiLocations from '../data/accurate_saudi_locations';

// Mapbox Access Token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiYWxpYWxzaGVocmlhciIsImEiOiJjbWdvemtkbzEwOHltMmlxdHh3M3l1cHBhIn0.c-t3RizZIPUwOr3ZTb2Ijw';

const EpicMap3D = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapStyle, setMapStyle] = useState('satellite-streets');
  const [isLoading, setIsLoading] = useState(true);

  // Ultra HD Map Styles
  const mapStyles = {
    'satellite-streets': 'mapbox://styles/mapbox/satellite-streets-v12',
    'streets': 'mapbox://styles/mapbox/streets-v12',
    'light': 'mapbox://styles/mapbox/light-v11',
    'dark': 'mapbox://styles/mapbox/dark-v11'
  };

  // Major Saudi cities for quick navigation
  const majorCities = [
    { name: 'الرياض', coordinates: [46.7219, 24.7136], zoom: 11 },
    { name: 'جدة', coordinates: [39.1925, 21.5433], zoom: 11 },
    { name: 'الدمام', coordinates: [50.0880, 26.4207], zoom: 11 },
    { name: 'مكة', coordinates: [39.8579, 21.4225], zoom: 12 },
    { name: 'المدينة', coordinates: [39.6142, 24.4672], zoom: 12 }
  ];

  useEffect(() => {
    if (map.current) return;

    // Initialize map with CINEMATIC 3D settings
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyles[mapStyle],
      center: [46.7219, 24.7136], // Riyadh center
      zoom: 11,
      pitch: 60, // CINEMATIC angle
      bearing: -17.6,
      antialias: true, // Ultra smooth edges
      maxPitch: 85,
      projection: 'globe'
    });

    map.current.on('load', () => {
      // Enable 3D terrain
      map.current.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
      });
      
      map.current.setTerrain({ 
        'source': 'mapbox-dem', 
        'exaggeration': 1.5 // Enhanced terrain
      });

      // Add 3D buildings layer with ULTRA details
      const layers = map.current.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
      ).id;

      map.current.addLayer(
        {
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 10,
          'paint': {
            'fill-extrusion-color': [
              'interpolate',
              ['linear'],
              ['get', 'height'],
              0, '#4A90E2',
              50, '#357ABD',
              100, '#2E6BA8',
              200, '#1E4D7B'
            ],
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 0,
              10.05, ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 0,
              10.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.85,
            'fill-extrusion-vertical-gradient': true
          }
        },
        labelLayerId
      );

      // Add atmospheric sky
      map.current.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 15
        }
      });

      // Add real estate location markers with custom styling
      accurateSaudiLocations.forEach((location, index) => {
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.cursor = 'pointer';
        el.style.transition = 'all 0.3s ease';
        
        // Color based on price
        let color = '#10B981'; // Green (cheap)
        if (location.price > 3500) color = '#EF4444'; // Red (expensive)
        else if (location.price > 2500) color = '#F59E0B'; // Orange (high)
        else if (location.price > 1500) color = '#3B82F6'; // Blue (medium)
        
        el.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="${color}" opacity="0.9" stroke="white" stroke-width="2"/>
            <path d="M12 7v10M7 12h10" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `;

        // Hover effect
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.3)';
          setHoveredLocation(location);
        });

        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          setHoveredLocation(null);
        });

        // Click handler
        el.addEventListener('click', () => {
          setSelectedLocation(location);
          // Fly to location with cinematic animation
          map.current.flyTo({
            center: location.coordinates,
            zoom: 15,
            pitch: 70,
            bearing: Math.random() * 360,
            duration: 2500,
            essential: true
          });
        });

        // Add marker to map
        new mapboxgl.Marker(el)
          .setLngLat(location.coordinates)
          .addTo(map.current);
      });

      setIsLoading(false);
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl({
      visualizePitch: true
    }), 'bottom-left');

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl({
      maxWidth: 100,
      unit: 'metric'
    }), 'bottom-left');

  }, []);

  // Update map style
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(mapStyles[mapStyle]);
  }, [mapStyle]);

  // Search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    
    const found = accurateSaudiLocations.find(loc => 
      loc.city.includes(query) || 
      loc.neighborhood.includes(query)
    );

    if (found) {
      setSelectedLocation(found);
      map.current.flyTo({
        center: found.coordinates,
        zoom: 15,
        pitch: 70,
        duration: 2500
      });
    }
  };

  // Navigate to city
  const flyToCity = (city) => {
    map.current.flyTo({
      center: city.coordinates,
      zoom: city.zoom,
      pitch: 60,
      duration: 2500,
      essential: true
    });
  };

  // Reset view
  const resetView = () => {
    map.current.flyTo({
      center: [46.7219, 24.7136],
      zoom: 11,
      pitch: 60,
      bearing: -17.6,
      duration: 2000
    });
    setSelectedLocation(null);
  };

  // Zoom controls
  const zoomIn = () => map.current.zoomIn({ duration: 500 });
  const zoomOut = () => map.current.zoomOut({ duration: 500 });

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
            <p className="text-white text-xl font-bold">جاري تحميل الخريطة...</p>
          </div>
        </div>
      )}

      {/* Map Container - Left Side (60%) */}
      <div className="absolute top-0 left-0 w-3/5 h-full">
        <div ref={mapContainer} className="w-full h-full" />
      </div>

      {/* Info Panel - Right Side (40%) */}
      <div className="absolute top-0 right-0 w-2/5 h-full bg-gradient-to-b from-gray-50 to-white shadow-2xl overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
              خريطة مُثمّن العقارية
            </h1>
            <p className="text-gray-600" style={{ fontFamily: 'Cairo, sans-serif' }}>
              استكشف 500 موقع عقاري في 42 مدينة
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن مدينة أو حي..."
                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-right"
                style={{ fontFamily: 'Cairo, sans-serif' }}
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Map Style Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
              نمط الخريطة
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(mapStyles).map((style) => (
                <button
                  key={style}
                  onClick={() => setMapStyle(style)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    mapStyle === style
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                >
                  {style === 'satellite-streets' && 'قمر صناعي'}
                  {style === 'streets' && 'شوارع'}
                  {style === 'light' && 'فاتح'}
                  {style === 'dark' && 'داكن'}
                </button>
              ))}
            </div>
          </div>

          {/* Quick City Navigation */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
              المدن الرئيسية
            </label>
            <div className="flex flex-wrap gap-2">
              {majorCities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => flyToCity(city)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-medium"
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>

          {/* Hovered Location Info */}
          {hoveredLocation && !selectedLocation && (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <h3 className="text-lg font-bold text-blue-900 mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
                {hoveredLocation.neighborhood}
              </h3>
              <p className="text-blue-700 text-sm" style={{ fontFamily: 'Cairo, sans-serif' }}>
                {hoveredLocation.city}
              </p>
              <p className="text-blue-600 text-sm mt-1" style={{ fontFamily: 'Cairo, sans-serif' }}>
                اضغط للمزيد من التفاصيل
              </p>
            </div>
          )}

          {/* Selected Location Details */}
          {selectedLocation && (
            <div className="bg-white border-2 border-blue-300 rounded-xl shadow-xl p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>
                    {selectedLocation.neighborhood}
                  </h2>
                  <p className="text-gray-600" style={{ fontFamily: 'Cairo, sans-serif' }}>
                    {selectedLocation.city}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Price */}
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <p className="text-white text-sm mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>السعر</p>
                <p className="text-white text-3xl font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>
                  {selectedLocation.price.toLocaleString()} ريال/م²
                </p>
              </div>

              {/* Trend */}
              <div className="mb-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium" style={{ fontFamily: 'Cairo, sans-serif' }}>
                  الاتجاه
                </span>
                <span className={`px-3 py-1 rounded-full font-bold ${
                  selectedLocation.trend === 'صاعد' ? 'bg-green-100 text-green-700' :
                  selectedLocation.trend === 'هابط' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`} style={{ fontFamily: 'Cairo, sans-serif' }}>
                  {selectedLocation.trend}
                </span>
              </div>

              {/* Rating */}
              <div className="mb-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium" style={{ fontFamily: 'Cairo, sans-serif' }}>
                  التقييم
                </span>
                <div className="flex items-center">
                  <span className="text-yellow-500 text-xl mr-2">★</span>
                  <span className="text-gray-800 font-bold text-lg">
                    {selectedLocation.rating}/5
                  </span>
                </div>
              </div>

              {/* Facilities */}
              <div className="mb-4">
                <p className="text-gray-700 font-semibold mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
                  المرافق المتوفرة
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedLocation.facilities.map((facility, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      style={{ fontFamily: 'Cairo, sans-serif' }}
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700" style={{ fontFamily: 'Cairo, sans-serif' }}>
                  {selectedLocation.description}
                </p>
              </div>

              {/* Coordinates */}
              <div className="text-xs text-gray-500 mt-4" style={{ fontFamily: 'Cairo, sans-serif' }}>
                <p>الإحداثيات: {selectedLocation.coordinates[1].toFixed(4)}, {selectedLocation.coordinates[0].toFixed(4)}</p>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <p className="text-sm opacity-90 mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>المواقع</p>
              <p className="text-3xl font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>500</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
              <p className="text-sm opacity-90 mb-1" style={{ fontFamily: 'Cairo, sans-serif' }}>متوسط السعر</p>
              <p className="text-2xl font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>
                {Math.round(accurateSaudiLocations.reduce((sum, loc) => sum + loc.price, 0) / accurateSaudiLocations.length).toLocaleString()} ر.س
              </p>
            </div>
          </div>

          {/* Color Legend */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3" style={{ fontFamily: 'Cairo, sans-serif' }}>
              دليل الألوان
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600" style={{ fontFamily: 'Cairo, sans-serif' }}>رخيص (&lt; 1,500)</span>
                <div className="w-6 h-6 rounded-full bg-green-500"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600" style={{ fontFamily: 'Cairo, sans-serif' }}>متوسط (1,500 - 2,500)</span>
                <div className="w-6 h-6 rounded-full bg-blue-500"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600" style={{ fontFamily: 'Cairo, sans-serif' }}>مرتفع (2,500 - 3,500)</span>
                <div className="w-6 h-6 rounded-full bg-orange-500"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600" style={{ fontFamily: 'Cairo, sans-serif' }}>غالي (&gt; 3,500)</span>
                <div className="w-6 h-6 rounded-full bg-red-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Controls - Over Map */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
        <button
          onClick={resetView}
          className="bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-lg shadow-lg transition-all"
          title="العودة للرياض"
        >
          <Home size={20} />
        </button>
        <button
          onClick={zoomIn}
          className="bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-lg shadow-lg transition-all"
          title="تكبير"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={zoomOut}
          className="bg-white hover:bg-gray-100 text-gray-700 p-3 rounded-lg shadow-lg transition-all"
          title="تصغير"
        >
          <ZoomOut size={20} />
        </button>
      </div>

      {/* 3D Badge */}
      <div className="absolute bottom-6 left-6 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg shadow-lg">
        <p className="text-sm font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>
          🎬 وضع 3D سينمائي
        </p>
      </div>
    </div>
  );
};

export default EpicMap3D;

