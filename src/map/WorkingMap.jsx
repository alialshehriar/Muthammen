import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox Token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWxpYWxzaGVocmlhciIsImEiOiJjbWdvemtkbzEwOHltMmlxdHh3M3l1cHBhIn0.c-t3RizZIPUwOr3ZTb2Ijw';

export default function WorkingMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(46.7);
  const [lat, setLat] = useState(24.7);
  const [zoom, setZoom] = useState(11);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (map.current) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: zoom
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-left');

      map.current.on('load', () => {
        setLoading(false);
        
        // استيراد البيانات الشاملة
        import('../data/saudi_locations.js').then(module => {
          const locations = module.saudiLocations;
          
          locations.forEach(location => {
            const city = location;
          // Create marker element
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.style.cssText = `
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
          `;
          el.innerHTML = '🏠';

            // Create popup
            const trendColor = city.trend === 'صاعد' ? '#10b981' : city.trend === 'هابط' ? '#ef4444' : '#667eea';
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="padding: 12px; font-family: 'Cairo', sans-serif; direction: rtl; min-width: 220px;">
                <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: bold; color: #1e293b;">
                  ${city.district}
                </h3>
                <p style="margin: 0 0 10px 0; font-size: 12px; color: #64748b;">
                  ${city.city}
                </p>
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px; border-radius: 8px; text-align: center; margin: 10px 0;">
                  <div style="font-size: 18px; font-weight: bold;">
                    ${city.price.toLocaleString()} ريال/م²
                  </div>
                  <div style="font-size: 11px; opacity: 0.9; margin-top: 4px;">
                    السعر المتوسط
                  </div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                  <div>
                    <span style="color: #94a3b8;">الاتجاه:</span>
                    <span style="color: ${trendColor}; font-weight: bold; margin-right: 4px;">${city.trend}</span>
                  </div>
                </div>
              </div>
            `);

            // Add marker
            new mapboxgl.Marker(el)
              .setLngLat(city.coords)
              .setPopup(popup)
              .addTo(map.current);
          });
        });
      });

      map.current.on('move', () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('حدث خطأ في تحميل الخريطة');
        setLoading(false);
      });

    } catch (err) {
      console.error('Map initialization error:', err);
      setError('فشل تهيئة الخريطة: ' + err.message);
      setLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">خطأ في الخريطة</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-bold text-gray-700">جاري تحميل الخريطة...</p>
            <p className="text-sm text-gray-500 mt-2">قد يستغرق بضع ثوان</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">م</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">خريطة مُثمّن</h1>
                <p className="text-sm text-gray-500">استكشف الأسعار العقارية في السعودية</p>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex gap-4 text-sm">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-gray-600">خط الطول: </span>
                <span className="font-bold text-blue-600">{lng}</span>
              </div>
              <div className="bg-purple-50 px-4 py-2 rounded-lg">
                <span className="text-gray-600">خط العرض: </span>
                <span className="font-bold text-purple-600">{lat}</span>
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-lg">
                <span className="text-gray-600">التكبير: </span>
                <span className="font-bold text-green-600">{zoom}x</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-4 z-10">
        <h3 className="font-bold text-sm text-gray-900 mb-3 text-right">دليل الخريطة</h3>
        <div className="space-y-2 text-xs text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-gray-700">مواقع عقارية</span>
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm">
              🏠
            </div>
          </div>
          <div className="pt-2 border-t border-gray-200 text-gray-500">
            اضغط على العلامات للمزيد
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-blue-600 text-white rounded-xl shadow-lg p-4 z-10 max-w-xs">
        <h3 className="font-bold mb-2 text-right">💡 نصائح الاستخدام</h3>
        <ul className="text-xs space-y-1 text-right">
          <li>• استخدم الماوس للتحرك والتكبير</li>
          <li>• اضغط على العلامات لعرض التفاصيل</li>
          <li>• استخدم الأزرار في الأعلى للتحكم</li>
        </ul>
      </div>
    </div>
  );
}

