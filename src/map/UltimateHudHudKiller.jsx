import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, Navigation, Layers, ZoomIn, ZoomOut, Maximize2, Home } from 'lucide-react';
import saudiLocations from '../data/accurate_saudi_locations';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function UltimateHudHudKiller() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapStyle, setMapStyle] = useState('satellite-streets');
  const [show3D, setShow3D] = useState(true);

  // Map styles
  const styles = {
    'satellite-streets': {
      url: 'mapbox://styles/mapbox/satellite-streets-v12',
      name: 'قمر صناعي + شوارع'
    },
    'streets': {
      url: 'mapbox://styles/mapbox/streets-v12',
      name: 'شوارع'
    },
    'dark': {
      url: 'mapbox://styles/mapbox/dark-v11',
      name: 'داكن'
    },
    'light': {
      url: 'mapbox://styles/mapbox/light-v11',
      name: 'فاتح'
    }
  };

  useEffect(() => {
    if (map.current) return;

    // Initialize map with premium 3D settings
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: styles[mapStyle].url,
      center: [46.6753, 24.7136], // Riyadh
      zoom: 11.5,
      pitch: 60,
      bearing: -17.6,
      antialias: true,
      maxZoom: 20,
      minZoom: 5,
      attributionControl: false
    });

    // Add attribution
    map.current.addControl(new mapboxgl.AttributionControl({
      compact: true
    }), 'bottom-left');

    map.current.on('load', () => {
      setLoading(false);

      // Add 3D buildings with enhanced details
      const layers = map.current.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
      )?.id;

      // Add 3D buildings layer
      if (!map.current.getLayer('3d-buildings')) {
        map.current.addLayer(
          {
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 13,
            paint: {
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['get', 'height'],
                0, '#e0e0e0',
                50, '#c0c0c0',
                100, '#a0a0a0',
                200, '#808080'
              ],
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13,
                0,
                13.05,
                ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                13,
                0,
                13.05,
                ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.9,
              'fill-extrusion-vertical-gradient': true
            }
          },
          labelLayerId
        );
      }

      // Add terrain for realistic 3D topography
      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });
      map.current.setTerrain({ 
        source: 'mapbox-dem', 
        exaggeration: 1.8 
      });

      // Add atmospheric sky
      map.current.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 15,
          'sky-gradient-center': [0, 0],
          'sky-gradient-radius': 90,
          'sky-opacity': [
            'interpolate',
            ['exponential', 0.1],
            ['zoom'],
            5,
            0,
            22,
            1
          ]
        }
      });

      // Create enhanced neighborhood polygons
      const polygonFeatures = saudiLocations.map((location, index) => {
        const radius = 0.025; // ~2.5km radius
        const points = 80; // More points for smoother circles
        const coordinates = [];
        
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * 2 * Math.PI;
          const lat = location.coordinates[1] + radius * Math.cos(angle);
          const lng = location.coordinates[0] + radius * Math.sin(angle);
          coordinates.push([lng, lat]);
        }
        coordinates.push(coordinates[0]);

        return {
          type: 'Feature',
          id: index,
          properties: {
            ...location,
            id: index,
            displayName: `${location.neighborhood} - ${location.city}`
          },
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates]
          }
        };
      });

      // Add neighborhoods source
      map.current.addSource('neighborhoods', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: polygonFeatures
        }
      });

      // Add polygon fill with gradient colors
      map.current.addLayer({
        id: 'neighborhoods-fill',
        type: 'fill',
        source: 'neighborhoods',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'pricePerMeter'],
            0, '#10b981',      // Green
            1000, '#3b82f6',   // Blue
            2000, '#8b5cf6',   // Purple
            3000, '#f59e0b',   // Orange
            4000, '#ef4444'    // Red
          ],
          'fill-opacity': 0.5
        }
      });

      // Add glowing outline
      map.current.addLayer({
        id: 'neighborhoods-outline',
        type: 'line',
        source: 'neighborhoods',
        paint: {
          'line-color': '#ffffff',
          'line-width': 3,
          'line-opacity': 0.9,
          'line-blur': 1
        }
      });

      // Add inner outline for depth
      map.current.addLayer({
        id: 'neighborhoods-outline-inner',
        type: 'line',
        source: 'neighborhoods',
        paint: {
          'line-color': '#000000',
          'line-width': 1,
          'line-opacity': 0.3
        }
      });

      // Add labels with Arabic font
      map.current.addLayer({
        id: 'neighborhoods-labels',
        type: 'symbol',
        source: 'neighborhoods',
        layout: {
          'text-field': ['get', 'neighborhood'],
          'text-font': ['Cairo Bold', 'Arial Unicode MS Bold'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 10,
            15, 16,
            18, 20
          ],
          'text-anchor': 'center',
          'text-allow-overlap': false,
          'text-optional': true
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 3,
          'text-halo-blur': 1
        }
      });

      // Add price labels
      map.current.addLayer({
        id: 'neighborhoods-price-labels',
        type: 'symbol',
        source: 'neighborhoods',
        minzoom: 13,
        layout: {
          'text-field': ['concat', ['to-string', ['get', 'pricePerMeter']], ' ر.س/م²'],
          'text-font': ['Cairo Regular', 'Arial Unicode MS Regular'],
          'text-size': 12,
          'text-anchor': 'top',
          'text-offset': [0, 1.5],
          'text-allow-overlap': false
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 2
        }
      });

      // Hover effect
      let hoveredId = null;
      map.current.on('mousemove', 'neighborhoods-fill', (e) => {
        if (e.features.length > 0) {
          map.current.getCanvas().style.cursor = 'pointer';
          
          if (hoveredId !== null) {
            map.current.setFeatureState(
              { source: 'neighborhoods', id: hoveredId },
              { hover: false }
            );
          }
          
          hoveredId = e.features[0].id;
          
          map.current.setFeatureState(
            { source: 'neighborhoods', id: hoveredId },
            { hover: true }
          );

          // Highlight on hover
          map.current.setPaintProperty('neighborhoods-fill', 'fill-opacity', [
            'case',
            ['==', ['get', 'id'], e.features[0].properties.id],
            0.8,
            0.5
          ]);
        }
      });

      map.current.on('mouseleave', 'neighborhoods-fill', () => {
        map.current.getCanvas().style.cursor = '';
        if (hoveredId !== null) {
          map.current.setFeatureState(
            { source: 'neighborhoods', id: hoveredId },
            { hover: false }
          );
        }
        hoveredId = null;
        map.current.setPaintProperty('neighborhoods-fill', 'fill-opacity', 0.5);
      });

      // Click to show details
      map.current.on('click', 'neighborhoods-fill', (e) => {
        if (e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties;
          
          // Parse coordinates if they're strings
          const coords = typeof props.coordinates === 'string' 
            ? JSON.parse(props.coordinates)
            : props.coordinates;
          
          setSelectedLocation({
            ...props,
            coordinates: coords
          });
          
          // Smooth fly to location
          map.current.flyTo({
            center: coords,
            zoom: 15.5,
            pitch: 65,
            bearing: -17.6,
            duration: 2500,
            essential: true,
            easing: (t) => t * (2 - t) // easeOutQuad
          });
        }
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Change map style
  const changeStyle = (newStyle) => {
    if (map.current) {
      map.current.setStyle(styles[newStyle].url);
      setMapStyle(newStyle);
      
      // Re-add layers after style change
      map.current.once('style.load', () => {
        // Re-add all custom layers here
        // (simplified for brevity)
      });
    }
  };

  // Toggle 3D
  const toggle3D = () => {
    if (map.current) {
      const newPitch = show3D ? 0 : 60;
      map.current.easeTo({
        pitch: newPitch,
        duration: 1000
      });
      setShow3D(!show3D);
    }
  };

  // Fly to city
  const flyToCity = (cityName) => {
    const cityLocation = saudiLocations.find(loc => loc.city === cityName);
    if (cityLocation && map.current) {
      map.current.flyTo({
        center: cityLocation.coordinates,
        zoom: 12.5,
        pitch: 60,
        duration: 2500,
        essential: true
      });
    }
  };

  // Search functionality
  const filteredLocations = saudiLocations.filter(loc =>
    loc.neighborhood.includes(searchQuery) || loc.city.includes(searchQuery)
  );

  return (
    <div className="h-screen w-full flex bg-gray-900" dir="rtl">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-white text-2xl font-bold mb-4">جاري تحميل الخريطة...</div>
              <div className="text-blue-400 text-lg">تحميل 500 موقع عقاري مع رسوميات 3D</div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="absolute top-6 right-6 w-96 z-10">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center p-4 border-b">
              <Search className="w-5 h-5 text-gray-400 ml-3" />
              <input
                type="text"
                placeholder="ابحث عن حي أو مدينة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-gray-800 text-lg"
              />
            </div>
            {searchQuery && filteredLocations.length > 0 && (
              <div className="max-h-64 overflow-y-auto">
                {filteredLocations.slice(0, 10).map((loc, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      flyToCity(loc.city);
                      setSearchQuery('');
                    }}
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                  >
                    <div className="font-semibold text-gray-800">{loc.neighborhood}</div>
                    <div className="text-sm text-gray-600">{loc.city}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* City Quick Navigation */}
        <div className="absolute top-6 left-6 bg-white rounded-xl shadow-2xl p-4 z-10">
          <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            المدن الرئيسية
          </h3>
          <div className="flex flex-col gap-2">
            {['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة'].map(city => (
              <button
                key={city}
                onClick={() => flyToCity(city)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all shadow-md hover:shadow-lg text-sm font-semibold"
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-24 left-6 bg-white rounded-xl shadow-2xl overflow-hidden z-10">
          <button
            onClick={() => map.current?.zoomIn()}
            className="p-3 hover:bg-gray-100 border-b transition-colors"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => map.current?.zoomOut()}
            className="p-3 hover:bg-gray-100 border-b transition-colors"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={toggle3D}
            className={`p-3 hover:bg-gray-100 border-b transition-colors ${show3D ? 'bg-blue-50' : ''}`}
          >
            <Layers className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => flyToCity('الرياض')}
            className="p-3 hover:bg-gray-100 transition-colors"
          >
            <Home className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 right-6 bg-white rounded-xl shadow-2xl p-4 z-10">
          <h3 className="text-sm font-bold mb-3 text-gray-800">دليل الأسعار (ريال/م²)</h3>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
              <span>أقل من 1,000</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
              <span>1,000 - 2,000</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded"></div>
              <span>2,000 - 3,000</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded"></div>
              <span>3,000 - 4,000</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded"></div>
              <span>أكثر من 4,000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Sidebar */}
      <div className="w-[420px] bg-white shadow-2xl overflow-y-auto">
        {selectedLocation ? (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedLocation.neighborhood}</h2>
              <p className="text-xl text-gray-600">{selectedLocation.city}</p>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
                <div className="text-sm opacity-90 mb-1">السعر للمتر المربع</div>
                <div className="text-4xl font-bold">{selectedLocation.pricePerMeter?.toLocaleString()} ريال</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="text-xs text-green-700 mb-1">الاتجاه</div>
                  <div className="text-lg font-bold text-green-800">{selectedLocation.trend}</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                  <div className="text-xs text-yellow-700 mb-1">التقييم</div>
                  <div className="text-lg font-bold text-yellow-800">{selectedLocation.rating} ⭐</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-bold text-gray-800 mb-3 text-lg">المرافق المتوفرة</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedLocation.amenities && JSON.parse(selectedLocation.amenities).map((amenity, idx) => (
                    <span key={idx} className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium border border-green-200">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {selectedLocation.services && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">الخدمات المتاحة</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(JSON.parse(selectedLocation.services)).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm border border-blue-200">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          {key}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  <div>الإحداثيات: {selectedLocation.coordinates[1].toFixed(6)}, {selectedLocation.coordinates[0].toFixed(6)}</div>
                  <div className="text-gray-400">معلومات دقيقة ومحدثة</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-8xl mb-6">🗺️</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">استكشف خريطة مُثمّن</h3>
            <p className="text-gray-600 mb-6 text-lg">اضغط على أي حي لعرض التفاصيل الكاملة</p>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-right space-y-3 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✨</div>
                <div>
                  <div className="font-bold text-gray-800">500 موقع عقاري</div>
                  <div className="text-sm text-gray-600">تغطية شاملة لجميع مدن المملكة</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🏗️</div>
                <div>
                  <div className="font-bold text-gray-800">مباني ثلاثية الأبعاد</div>
                  <div className="text-sm text-gray-600">رسوميات عالية الدقة</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🛰️</div>
                <div>
                  <div className="font-bold text-gray-800">صور قمر صناعي HD</div>
                  <div className="text-sm text-gray-600">تفاصيل دقيقة للشوارع والمباني</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">📊</div>
                <div>
                  <div className="font-bold text-gray-800">بيانات محدثة</div>
                  <div className="text-sm text-gray-600">أسعار واقعية ومعلومات دقيقة</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

