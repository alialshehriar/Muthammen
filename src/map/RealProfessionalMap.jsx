import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import saudiLocations from '../data/accurate_saudi_locations';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function RealProfessionalMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (map.current) return;

    // Initialize map with 3D settings
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12', // HD Satellite with streets
      center: [46.6753, 24.7136], // Riyadh center
      zoom: 11,
      pitch: 60, // 3D angle
      bearing: -17.6,
      antialias: true,
      maxZoom: 18,
      minZoom: 5
    });

    map.current.on('load', () => {
      setLoading(false);

      // Add 3D buildings layer
      const layers = map.current.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
      ).id;

      map.current.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14,
              0,
              14.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14,
              0,
              14.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.8
          }
        },
        labelLayerId
      );

      // Add terrain for realistic 3D
      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });
      map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // Add sky layer for atmosphere
      map.current.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15
        }
      });

      // Create GeoJSON for neighborhood polygons
      const polygonFeatures = saudiLocations.map((location, index) => {
        // Create circular polygon around each location (2km radius)
        const radius = 0.02; // ~2km in degrees
        const points = 64;
        const coordinates = [];
        
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * 2 * Math.PI;
          const lat = location.coordinates[1] + radius * Math.cos(angle);
          const lng = location.coordinates[0] + radius * Math.sin(angle);
          coordinates.push([lng, lat]);
        }
        coordinates.push(coordinates[0]); // Close the polygon

        return {
          type: 'Feature',
          id: index,
          properties: {
            ...location,
            id: index
          },
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates]
          }
        };
      });

      // Add neighborhood polygons source
      map.current.addSource('neighborhoods', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: polygonFeatures
        }
      });

      // Add polygon fill layer with color based on price
      map.current.addLayer({
        id: 'neighborhoods-fill',
        type: 'fill',
        source: 'neighborhoods',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'pricePerMeter'],
            0, '#22c55e',      // Green for cheap
            1500, '#3b82f6',   // Blue for moderate
            2500, '#f97316',   // Orange for expensive
            3500, '#ef4444'    // Red for very expensive
          ],
          'fill-opacity': 0.4
        }
      });

      // Add polygon outline layer
      map.current.addLayer({
        id: 'neighborhoods-outline',
        type: 'line',
        source: 'neighborhoods',
        paint: {
          'line-color': '#ffffff',
          'line-width': 2,
          'line-opacity': 0.8
        }
      });

      // Add labels for neighborhoods
      map.current.addLayer({
        id: 'neighborhoods-labels',
        type: 'symbol',
        source: 'neighborhoods',
        layout: {
          'text-field': ['get', 'neighborhood'],
          'text-font': ['Cairo Bold', 'Arial Unicode MS Bold'],
          'text-size': 14,
          'text-anchor': 'center',
          'text-allow-overlap': false
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 2
        }
      });

      // Hover effect
      map.current.on('mousemove', 'neighborhoods-fill', (e) => {
        if (e.features.length > 0) {
          map.current.getCanvas().style.cursor = 'pointer';
          
          // Highlight on hover
          map.current.setPaintProperty('neighborhoods-fill', 'fill-opacity', [
            'case',
            ['==', ['get', 'id'], e.features[0].properties.id],
            0.7,
            0.4
          ]);
        }
      });

      map.current.on('mouseleave', 'neighborhoods-fill', () => {
        map.current.getCanvas().style.cursor = '';
        map.current.setPaintProperty('neighborhoods-fill', 'fill-opacity', 0.4);
      });

      // Click to show details
      map.current.on('click', 'neighborhoods-fill', (e) => {
        if (e.features.length > 0) {
          const feature = e.features[0];
          setSelectedLocation(feature.properties);
          
          // Fly to location
          map.current.flyTo({
            center: [feature.properties.coordinates[0], feature.properties.coordinates[1]],
            zoom: 15,
            pitch: 60,
            bearing: -17.6,
            duration: 2000,
            essential: true
          });
        }
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-left');
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const flyToCity = (cityName) => {
    const cityLocation = saudiLocations.find(loc => loc.city === cityName);
    if (cityLocation && map.current) {
      map.current.flyTo({
        center: cityLocation.coordinates,
        zoom: 12,
        pitch: 60,
        duration: 2000,
        essential: true
      });
    }
  };

  return (
    <div className="h-screen w-full flex" dir="rtl">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <div className="text-white text-xl">جاري تحميل الخريطة...</div>
          </div>
        )}

        {/* City Quick Navigation */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-gray-800">المدن الرئيسية</h3>
          <div className="flex flex-col gap-2">
            {['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة'].map(city => (
              <button
                key={city}
                onClick={() => flyToCity(city)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-sm font-bold mb-2 text-gray-800">دليل الأسعار</h3>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>أقل من 1,500 ريال/م²</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>1,500 - 2,500 ريال/م²</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>2,500 - 3,500 ريال/م²</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>أكثر من 3,500 ريال/م²</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Sidebar */}
      <div className="w-96 bg-white shadow-xl overflow-y-auto">
        {selectedLocation ? (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedLocation.neighborhood}</h2>
            <p className="text-gray-600 mb-6">{selectedLocation.city}</p>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">السعر للمتر المربع</div>
                <div className="text-3xl font-bold text-blue-600">{selectedLocation.pricePerMeter.toLocaleString()} ريال</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600">الاتجاه</div>
                  <div className="text-lg font-semibold text-gray-800">{selectedLocation.trend}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600">التقييم</div>
                  <div className="text-lg font-semibold text-gray-800">{selectedLocation.rating} ⭐</div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-2">المرافق المتوفرة</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedLocation.amenities?.map((amenity, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {selectedLocation.services && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">الخدمات</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedLocation.services).map(([key, value]) => (
                      value && (
                        <span key={key} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {key}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="text-xs text-gray-500">
                  الإحداثيات: {selectedLocation.coordinates[1].toFixed(4)}, {selectedLocation.coordinates[0].toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold mb-2">استكشف الخريطة</h3>
            <p>اضغط على أي حي لعرض التفاصيل</p>
            <div className="mt-6 text-sm text-gray-600">
              <p className="mb-2">✨ 500 موقع عقاري</p>
              <p className="mb-2">🏗️ مباني ثلاثية الأبعاد</p>
              <p className="mb-2">🛰️ صور قمر صناعي HD</p>
              <p>📊 بيانات دقيقة ومحدثة</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

