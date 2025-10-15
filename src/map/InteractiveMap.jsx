import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import riyadhNeighborhoods from '../data/riyadh_neighborhoods.js';
import { MapPin, TrendingUp, TrendingDown, Minus, Star, Home, DollarSign } from 'lucide-react';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiYWxpYWxzaGVocmlhciIsImEiOiJjbWdvemtkbzEwOHltMmlxdHh3M3l1cHBhIn0.c-t3RizZIPUwOr3ZTb2Ijw';

export default function InteractiveMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [loading, setLoading] = useState(true);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);

  // Find neighborhood by coordinates
  const findNeighborhood = (lng, lat) => {
    for (const feature of riyadhNeighborhoods.features) {
      const coords = feature.geometry.coordinates[0];
      // Simple point-in-polygon check
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
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [46.6753, 24.7136],
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    });

    map.current.on('load', () => {
      // Add click handler
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        const neighborhood = findNeighborhood(lng, lat);
        
        if (neighborhood) {
          setSelectedNeighborhood(neighborhood);
          
          // Update or create marker
          if (marker.current) {
            marker.current.setLngLat([lng, lat]);
          } else {
            marker.current = new mapboxgl.Marker({
              color: '#3b82f6',
              scale: 1.2
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

  // Calculate price range color
  const getPriceColor = (priceRange) => {
    switch(priceRange) {
      case '1000-2000': return '#22c55e';
      case '2000-3000': return '#3b82f6';
      case '3000-4000': return '#f59e0b';
      case '4000+': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    if (trend === 'صاعد') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (trend === 'هابط') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      {/* Map Section */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">جاري تحميل الخريطة...</p>
            </div>
          </div>
        )}
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Instructions overlay */}
        {!selectedNeighborhood && !loading && (
          <div className="absolute top-4 left-4 right-4 lg:left-auto lg:w-96 bg-white rounded-lg shadow-lg p-6 z-10">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-800">اكتشف أسعار الأحياء</h3>
            </div>
            <p className="text-gray-600 text-sm">
              اضغط على أي موقع في خريطة الرياض لعرض معلومات الحي وأسعار العقارات
            </p>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="w-full lg:w-[480px] bg-white shadow-2xl overflow-y-auto">
        {selectedNeighborhood ? (
          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-3xl font-bold text-gray-900">{selectedNeighborhood.name}</h2>
                {getTrendIcon(selectedNeighborhood.trend)}
              </div>
              <p className="text-gray-500 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {selectedNeighborhood.city}
              </p>
            </div>

            {/* Price Indicator Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">النطاق السعري</span>
                <span className="text-sm font-bold text-gray-800">{selectedNeighborhood.priceRange} ر.س/م²</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: '100%',
                    backgroundColor: getPriceColor(selectedNeighborhood.priceRange)
                  }}
                ></div>
              </div>
            </div>

            {/* Price Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Sale Price */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">سعر البيع</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{selectedNeighborhood.price.toLocaleString()}</p>
                <p className="text-xs text-blue-700 mt-1">ريال/م²</p>
              </div>

              {/* Rental Price (estimated) */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">سعر الإيجار</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{Math.round(selectedNeighborhood.price * 0.04).toLocaleString()}</p>
                <p className="text-xs text-green-700 mt-1">ريال/شهر (تقديري)</p>
              </div>
            </div>

            {/* Rating */}
            <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-900">تقييم الحي</span>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="text-2xl font-bold text-amber-900">{selectedNeighborhood.rating}</span>
                  <span className="text-sm text-amber-700">/5</span>
                </div>
              </div>
            </div>

            {/* Trend Info */}
            <div className={`rounded-xl p-5 mb-6 ${
              selectedNeighborhood.trend === 'صاعد' ? 'bg-green-50 border border-green-200' :
              selectedNeighborhood.trend === 'هابط' ? 'bg-red-50 border border-red-200' :
              'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                {getTrendIcon(selectedNeighborhood.trend)}
                <div>
                  <p className="font-semibold text-gray-900">اتجاه السوق</p>
                  <p className={`text-sm ${
                    selectedNeighborhood.trend === 'صاعد' ? 'text-green-700' :
                    selectedNeighborhood.trend === 'هابط' ? 'text-red-700' :
                    'text-gray-700'
                  }`}>
                    {selectedNeighborhood.trend === 'صاعد' && 'الأسعار في ارتفاع مستمر'}
                    {selectedNeighborhood.trend === 'هابط' && 'الأسعار في انخفاض'}
                    {selectedNeighborhood.trend === 'مستقر' && 'الأسعار مستقرة'}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Range Legend */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">دليل النطاقات السعرية</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-green-500"></div>
                  <span className="text-sm text-gray-700">أقل من 2,000 ر.س/م²</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-blue-500"></div>
                  <span className="text-sm text-gray-700">2,000 - 3,000 ر.س/م²</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-orange-500"></div>
                  <span className="text-sm text-gray-700">3,000 - 4,000 ر.س/م²</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-red-500"></div>
                  <span className="text-sm text-gray-700">أكثر من 4,000 ر.س/م²</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center max-w-md">
              <MapPin className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-3">اختر موقع على الخريطة</h3>
              <p className="text-gray-600 leading-relaxed">
                اضغط على أي نقطة في خريطة الرياض لعرض معلومات تفصيلية عن الحي وأسعار العقارات للبيع والإيجار
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

