import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { saudiLocations } from '../data/saudi_locations';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiYWxpYWxzaGVocmlhciIsImEiOiJjbWdvemtkbzEwOHltMmlxdHh3M3l1cHBhIn0.c-t3RizZIPUwOr3ZTb2Ijw';

export default function FinalMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('streets');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, avgPrice: 0, cities: 0 });

  // حساب الإحصائيات
  useEffect(() => {
    const totalLocations = saudiLocations.length;
    const avgPrice = Math.round(
      saudiLocations.reduce((sum, loc) => sum + loc.price, 0) / totalLocations
    );
    const uniqueCities = new Set(saudiLocations.map(loc => loc.city)).size;
    
    setStats({
      total: totalLocations,
      avgPrice,
      cities: uniqueCities
    });
  }, []);

  // تهيئة الخريطة
  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [46.7, 24.7], // الرياض
        zoom: 5.5,
        pitch: 0,
        bearing: 0,
        attributionControl: false
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-left');

      map.current.on('load', () => {
        setLoading(false);
        addMarkers();
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setLoading(false);
      });

    } catch (error) {
      console.error('Failed to initialize map:', error);
      setLoading(false);
    }

    return () => {
      markers.current.forEach(marker => marker.remove());
      if (map.current) map.current.remove();
    };
  }, []);

  // إضافة العلامات
  const addMarkers = () => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    saudiLocations.forEach((location) => {
      // إنشاء أيقونة مخصصة
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.cssText = `
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      // أيقونة المنزل داخل العلامة
      const icon = document.createElement('div');
      icon.innerHTML = '🏠';
      icon.style.cssText = `
        transform: rotate(45deg);
        font-size: 14px;
      `;
      el.appendChild(icon);

      // تأثير Hover
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'rotate(-45deg) scale(1.2)';
        el.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.6)';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'rotate(-45deg) scale(1)';
        el.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.4)';
      });

      // إنشاء Popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'custom-popup'
      }).setHTML(`
        <div style="
          font-family: 'Cairo', 'Noto Sans Arabic', sans-serif;
          direction: rtl;
          padding: 12px;
          min-width: 280px;
        ">
          <div style="
            font-size: 16px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <span style="font-size: 20px;">📍</span>
            ${location.district}
          </div>
          
          <div style="
            font-size: 14px;
            color: #64748b;
            margin-bottom: 12px;
          ">
            ${location.city}
          </div>

          <div style="
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 10px;
          ">
            <div style="
              font-size: 13px;
              color: #475569;
              margin-bottom: 4px;
            ">
              💰 السعر
            </div>
            <div style="
              font-size: 18px;
              font-weight: 700;
              color: #2563eb;
            ">
              ${location.price.toLocaleString()} ريال/م²
            </div>
          </div>

          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 10px;
          ">
            <div style="
              background: white;
              padding: 8px;
              border-radius: 6px;
              border: 1px solid #e2e8f0;
            ">
              <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">الاتجاه</div>
              <div style="font-size: 13px; font-weight: 600; color: ${
                location.trend === 'صاعد' ? '#10b981' : 
                location.trend === 'هابط' ? '#ef4444' : '#64748b'
              };">
                ${location.trend === 'صاعد' ? '📈' : location.trend === 'هابط' ? '📉' : '➡️'} ${location.trend}
              </div>
            </div>
            
            <div style="
              background: white;
              padding: 8px;
              border-radius: 6px;
              border: 1px solid #e2e8f0;
            ">
              <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">التقييم</div>
              <div style="font-size: 13px; font-weight: 600; color: #f59e0b;">
                ⭐ ${location.rating}/5
              </div>
            </div>
          </div>

          <div style="
            font-size: 12px;
            color: #64748b;
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          ">
            ${location.facilities.map(f => `
              <span style="
                background: #f1f5f9;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
              ">
                ${f}
              </span>
            `).join('')}
          </div>

          <button onclick="window.dispatchEvent(new CustomEvent('showLocationDetails', { detail: ${JSON.stringify(location)} }))" style="
            width: 100%;
            margin-top: 12px;
            padding: 10px;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            font-family: 'Cairo', sans-serif;
            transition: all 0.2s;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(37, 99, 235, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            عرض التفاصيل الكاملة
          </button>
        </div>
      `);

      // إضافة العلامة
      const marker = new mapboxgl.Marker(el)
        .setLngLat(location.coords)
        .setPopup(popup)
        .addTo(map.current);

      markers.current.push(marker);
    });
  };

  // تغيير نمط الخريطة
  const changeMapStyle = (style) => {
    if (!map.current) return;
    
    const styles = {
      streets: 'mapbox://styles/mapbox/streets-v12',
      satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
      light: 'mapbox://styles/mapbox/light-v11',
      dark: 'mapbox://styles/mapbox/dark-v11'
    };

    map.current.setStyle(styles[style]);
    setViewMode(style);

    // إعادة إضافة العلامات بعد تغيير النمط
    map.current.once('styledata', () => {
      addMarkers();
    });
  };

  // البحث عن موقع
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const found = saudiLocations.find(loc => 
      loc.city.includes(searchQuery) || 
      loc.district.includes(searchQuery)
    );

    if (found && map.current) {
      map.current.flyTo({
        center: found.coords,
        zoom: 13,
        duration: 2000,
        essential: true
      });

      // فتح Popup
      const marker = markers.current.find(m => 
        m.getLngLat().lng === found.coords[0] && 
        m.getLngLat().lat === found.coords[1]
      );
      if (marker) marker.togglePopup();
    }
  };

  // الانتقال إلى مدينة
  const flyToCity = (cityName) => {
    const cityLocations = saudiLocations.filter(loc => loc.city === cityName);
    if (cityLocations.length === 0 || !map.current) return;

    const firstLocation = cityLocations[0];
    map.current.flyTo({
      center: firstLocation.coords,
      zoom: 11,
      duration: 2000,
      essential: true
    });
  };

  const majorCities = [
    { name: 'الرياض', coords: [46.7, 24.7] },
    { name: 'جدة', coords: [39.19, 21.54] },
    { name: 'الدمام', coords: [50.1, 26.43] },
    { name: 'مكة', coords: [39.83, 21.42] },
    { name: 'المدينة', coords: [39.61, 24.47] }
  ];

  return (
    <div className="relative w-full h-screen bg-gray-50">
      {/* شريط العنوان */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                🗺️
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">خريطة مُثمّن العقارية</h1>
                <p className="text-sm text-gray-600">استكشف {stats.total} موقع عقاري في {stats.cities} مدينة</p>
              </div>
            </div>

            {/* إحصائيات */}
            <div className="flex gap-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <div className="text-xs text-gray-600">المواقع</div>
                <div className="text-lg font-bold text-blue-900">{stats.total}</div>
              </div>
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <div className="text-xs text-gray-600">متوسط السعر</div>
                <div className="text-lg font-bold text-blue-900">{stats.avgPrice.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* شريط البحث والأدوات */}
      <div className="absolute top-24 left-4 right-4 z-10 flex flex-col gap-3">
        {/* البحث */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-lg p-3 flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مدينة أو حي..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            style={{ fontFamily: "'Cairo', 'Noto Sans Arabic', sans-serif" }}
          />
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
          >
            🔍 بحث
          </button>
        </form>

        {/* المدن الرئيسية */}
        <div className="bg-white rounded-xl shadow-lg p-3 flex gap-2 overflow-x-auto">
          {majorCities.map(city => (
            <button
              key={city.name}
              onClick={() => flyToCity(city.name)}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg font-semibold whitespace-nowrap transition-all"
            >
              📍 {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* أزرار تغيير النمط */}
      <div className="absolute top-24 left-4 z-10 bg-white rounded-xl shadow-lg p-2 flex flex-col gap-2">
        <button
          onClick={() => changeMapStyle('streets')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'streets' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title="خريطة الشوارع"
        >
          🗺️
        </button>
        <button
          onClick={() => changeMapStyle('satellite')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'satellite' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title="قمر صناعي"
        >
          🛰️
        </button>
        <button
          onClick={() => changeMapStyle('light')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'light' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title="فاتح"
        >
          ☀️
        </button>
        <button
          onClick={() => changeMapStyle('dark')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'dark' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title="داكن"
        >
          🌙
        </button>
      </div>

      {/* الخريطة */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* شاشة التحميل */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-bold text-blue-900">جاري تحميل الخريطة...</p>
            <p className="text-sm text-gray-600 mt-2">تحميل {stats.total} موقع عقاري</p>
          </div>
        </div>
      )}

      {/* CSS مخصص للـ Popup */}
      <style>{`
        .custom-popup .mapboxgl-popup-content {
          padding: 0;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          font-family: 'Cairo', 'Noto Sans Arabic', sans-serif;
        }
        .custom-popup .mapboxgl-popup-tip {
          border-top-color: white;
        }
        .mapboxgl-ctrl-attrib {
          display: none;
        }
      `}</style>
    </div>
  );
}

