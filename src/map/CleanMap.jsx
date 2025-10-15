import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import riyadhNeighborhoods from '../data/riyadh_neighborhoods.js';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiYWxpYWxzaGVocmlhciIsImEiOiJjbWdvemtkbzEwOHltMmlxdHh3M3l1cHBhIn0.c-t3RizZIPUwOr3ZTb2Ijw';

export default function CleanMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [loading, setLoading] = useState(true);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);

  const findNeighborhood = (lng, lat) => {
    for (const feature of riyadhNeighborhoods.features) {
      const coords = feature.geometry.coordinates[0];
      if (lng >= coords[0][0] && lng <= coords[2][0] &&
          lat >= coords[0][1] && lat <= coords[2][1]) {
        return feature.properties;
      }
    }
    return null;
  };

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [46.6753, 24.7136],
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    });

    map.current.on('load', () => {
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        const neighborhood = findNeighborhood(lng, lat);
        
        if (neighborhood) {
          setSelectedNeighborhood(neighborhood);
          
          if (marker.current) {
            marker.current.setLngLat([lng, lat]);
          } else {
            marker.current = new mapboxgl.Marker({
              color: '#2563eb',
              scale: 1
            })
              .setLngLat([lng, lat])
              .addTo(map.current);
          }
        }
      });

      setLoading(false);
    });

    return () => map.current?.remove();
  }, []);

  const getPriceColor = (priceRange) => {
    switch(priceRange) {
      case '1000-2000': return '#10b981';
      case '2000-3000': return '#3b82f6';
      case '3000-4000': return '#f59e0b';
      case '4000+': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">جاري التحميل</p>
            </div>
          </div>
        )}
        <div ref={mapContainer} className="w-full h-full" />
        
        {!selectedNeighborhood && !loading && (
          <div className="absolute top-6 left-6 right-6 lg:left-auto lg:w-80 bg-white rounded-lg shadow-md p-5 z-10 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-2">استكشف أسعار العقارات</h3>
            <p className="text-gray-600 text-sm">اضغط على أي موقع في الخريطة لعرض التفاصيل</p>
          </div>
        )}
      </div>

      <div className="w-full lg:w-96 bg-white border-l border-gray-200 overflow-y-auto">
        {selectedNeighborhood ? (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedNeighborhood.name}</h2>
              <p className="text-gray-500 text-sm">{selectedNeighborhood.city}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">النطاق السعري</span>
                <span className="text-xs font-semibold text-gray-900">{selectedNeighborhood.priceRange} ر.س/م²</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    width: '100%',
                    backgroundColor: getPriceColor(selectedNeighborhood.priceRange)
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">سعر البيع</div>
                <div className="text-xl font-bold text-gray-900">{selectedNeighborhood.price.toLocaleString()}</div>
                <div className="text-xs text-gray-500">ريال للمتر المربع</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-xs text-gray-600 mb-1">سعر الإيجار التقديري</div>
                <div className="text-xl font-bold text-gray-900">{Math.round(selectedNeighborhood.price * 0.04).toLocaleString()}</div>
                <div className="text-xs text-gray-500">ريال شهرياً</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">التقييم</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{selectedNeighborhood.rating}</span>
                  <span className="text-xs text-gray-500">من 5</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
              <div className="text-xs text-gray-600 mb-1">اتجاه السوق</div>
              <div className="text-sm font-semibold text-gray-900">{selectedNeighborhood.trend}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-xs font-semibold text-gray-900 mb-3">دليل الأسعار</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span className="text-gray-700">أقل من 2,000</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded bg-blue-500"></div>
                  <span className="text-gray-700">2,000 - 3,000</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded bg-orange-500"></div>
                  <span className="text-gray-700">3,000 - 4,000</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span className="text-gray-700">أكثر من 4,000</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center max-w-xs">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">اختر موقعاً</h3>
              <p className="text-sm text-gray-600">اضغط على الخريطة لعرض معلومات الحي والأسعار</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

