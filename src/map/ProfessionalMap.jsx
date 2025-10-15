import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import realEstateData from '../data/map/saudi_real_estate_complete.json';

// Mapbox Access Token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiYWxpYWxzaGVocmlhciIsImEiOiJjbWdvemtkbzEwOHltMmlxdHh3M3l1cHBhIn0.c-t3RizZIPUwOr3ZTb2Ijw';
mapboxgl.accessToken = MAPBOX_TOKEN;

export default function ProfessionalMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapStyle, setMapStyle] = useState('streets');

  useEffect(() => {
    if (map.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [45.0, 24.0],
      zoom: 5.5,
      pitch: 0,
      bearing: 0,
      attributionControl: false
    });

    // Add controls
    map.current.addControl(new mapboxgl.NavigationControl({
      visualizePitch: true
    }), 'bottom-left');

    map.current.addControl(new mapboxgl.FullscreenControl(), 'bottom-left');

    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    }), 'bottom-left');

    // On load
    map.current.on('load', () => {
      setLoading(false);

      // Add data source
      map.current.addSource('properties', {
        type: 'geojson',
        data: realEstateData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Cluster circles
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'properties',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#667eea',
            5,
            '#764ba2',
            10,
            '#f093fb'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            25,
            5,
            35,
            10,
            45
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9
        }
      });

      // Cluster count
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'properties',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
          'text-size': 16
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Individual points
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'properties',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'trend'],
            'صاعد', '#10b981',
            'مستقر', '#667eea',
            'هابط', '#ef4444',
            '#667eea'
          ],
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5, 8,
            10, 15,
            15, 25
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.95
        }
      });

      // Point labels
      map.current.addLayer({
        id: 'point-labels',
        type: 'symbol',
        source: 'properties',
        filter: ['!', ['has', 'point_count']],
        minzoom: 10,
        layout: {
          'text-field': ['get', 'district'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Regular'],
          'text-size': 12,
          'text-offset': [0, 2],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#1e293b',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2
        }
      });

      // Interactions
      setupInteractions();
    });

    return () => {
      if (map.current) map.current.remove();
    };
  }, []);

  // Update map style
  useEffect(() => {
    if (!map.current) return;
    
    const styles = {
      streets: 'mapbox://styles/mapbox/streets-v12',
      satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
      light: 'mapbox://styles/mapbox/light-v11'
    };

    map.current.setStyle(styles[mapStyle]);
  }, [mapStyle]);

  const setupInteractions = () => {
    // Click on cluster
    map.current.on('click', 'clusters', (e) => {
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties.cluster_id;
      
      map.current.getSource('properties').getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err) return;
          
          map.current.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom + 1,
            duration: 800
          });
        }
      );
    });

    // Click on point
    map.current.on('click', 'unclustered-point', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const properties = e.features[0].properties;

      setSelectedProperty(properties);

      map.current.flyTo({
        center: coordinates,
        zoom: 14,
        duration: 1500,
        essential: true
      });
    });

    // Cursor pointer
    ['clusters', 'unclustered-point'].forEach(layer => {
      map.current.on('mouseenter', layer, () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', layer, () => {
        map.current.getCanvas().style.cursor = '';
      });
    });

    // Hover popup
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 15
    });

    map.current.on('mouseenter', 'unclustered-point', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const props = e.features[0].properties;

      const trendColor = props.trend === 'صاعد' ? '#10b981' : 
                         props.trend === 'هابط' ? '#ef4444' : '#667eea';

      popup
        .setLngLat(coordinates)
        .setHTML(`
          <div style="padding: 12px; min-width: 220px; font-family: 'Cairo', sans-serif; direction: rtl;">
            <div style="font-size: 15px; font-weight: bold; color: #1e293b; margin-bottom: 8px;">
              ${props.district}
            </div>
            <div style="font-size: 13px; color: #64748b; margin-bottom: 10px;">
              ${props.city}
            </div>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px; border-radius: 8px; text-align: center; margin-bottom: 10px;">
              <div style="font-size: 18px; font-weight: bold;">
                ${props.avgPrice.toLocaleString()} ريال/م²
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #64748b;">
              <div>
                <div style="color: #94a3b8;">الاتجاه</div>
                <div style="color: ${trendColor}; font-weight: bold;">${props.trend}</div>
              </div>
              <div style="text-align: left;">
                <div style="color: #94a3b8;">النمو</div>
                <div style="color: ${trendColor}; font-weight: bold;">${props.growth > 0 ? '+' : ''}${props.growth}%</div>
              </div>
            </div>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
              اضغط للتفاصيل
            </div>
          </div>
        `)
        .addTo(map.current);
    });

    map.current.on('mouseleave', 'unclustered-point', () => {
      popup.remove();
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) return;

    const feature = realEstateData.features.find(f => 
      f.properties.city.includes(query) || 
      f.properties.district.includes(query)
    );

    if (feature) {
      map.current.flyTo({
        center: feature.geometry.coordinates,
        zoom: 13,
        duration: 2000
      });
    }
  };

  const analyzeWithAI = async () => {
    if (!selectedProperty) return;
    
    alert('🤖 تحليل الذكاء الاصطناعي قيد التطوير');
  };

  return (
    <div className="relative w-full h-screen bg-gray-50">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-bold text-gray-700">جاري تحميل الخريطة...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xl font-bold">م</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">خريطة مُثمّن</h1>
                <p className="text-xs text-gray-500">استكشف الأسعار العقارية</p>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="🔍 ابحث عن مدينة أو حي..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none text-right"
              />
            </div>

            {/* Style Switcher */}
            <div className="flex gap-2">
              <button
                onClick={() => setMapStyle('streets')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  mapStyle === 'streets'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                خريطة
              </button>
              <button
                onClick={() => setMapStyle('satellite')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  mapStyle === 'satellite'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                قمر صناعي
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Property Details Panel */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:w-[400px] bg-white rounded-2xl shadow-2xl z-10 max-h-[70vh] overflow-y-auto">
          <div className="p-6">
            {/* Close Button */}
            <button
              onClick={() => setSelectedProperty(null)}
              className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
            >
              ✕
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedProperty.district}</h2>
              <p className="text-gray-500">{selectedProperty.city} • {selectedProperty.region}</p>
            </div>

            {/* Price Card */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6 rounded-xl mb-6 shadow-lg">
              <div className="text-center">
                <p className="text-sm opacity-90 mb-1">السعر المتوسط</p>
                <p className="text-4xl font-bold mb-1">{selectedProperty.avgPrice.toLocaleString()}</p>
                <p className="text-sm opacity-90">ريال/م²</p>
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t border-white/20 text-sm">
                <div>
                  <p className="opacity-75">الأدنى</p>
                  <p className="font-bold">{selectedProperty.minPrice.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="opacity-75">الاتجاه</p>
                  <p className="font-bold">{selectedProperty.trend}</p>
                </div>
                <div className="text-right">
                  <p className="opacity-75">الأعلى</p>
                  <p className="font-bold">{selectedProperty.maxPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-green-50 border-2 border-green-200 p-4 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">مستوى الثقة</p>
                <p className="text-2xl font-bold text-green-600">{selectedProperty.confidence}%</p>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">عدد العينات</p>
                <p className="text-2xl font-bold text-blue-600">{selectedProperty.samples}</p>
              </div>
              <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">الجودة</p>
                <p className="text-lg font-bold text-purple-600">{selectedProperty.quality}</p>
              </div>
              <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">الاستثمار</p>
                <p className="text-lg font-bold text-orange-600">{selectedProperty.investment}</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <p className="text-sm text-gray-700 leading-relaxed">{selectedProperty.description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-6">
              <p className="text-sm font-bold text-gray-700 mb-3">المرافق القريبة:</p>
              <div className="flex flex-wrap gap-2">
                {JSON.parse(selectedProperty.amenities).map((amenity, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Analysis Button */}
            <button
              onClick={analyzeWithAI}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all"
            >
              🤖 تحليل بالذكاء الاصطناعي
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-4 z-10">
        <h3 className="font-bold text-sm text-gray-900 mb-3">دليل الألوان</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-gray-700">صاعد</span>
            <div className="w-4 h-4 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-gray-700">مستقر</span>
            <div className="w-4 h-4 rounded-full bg-blue-500" />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-gray-700">هابط</span>
            <div className="w-4 h-4 rounded-full bg-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

