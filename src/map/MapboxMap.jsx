import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import realEstateData from '../data/map/real_estate_data.json';

// Mapbox Access Token (مجاني - يمكن استبداله بمفتاحك)
mapboxgl.accessToken = 'pk.eyJ1IjoibWFudXMtZGVtbyIsImEiOiJjbHkwMDAwMDAwMDAwMDJwY2RxYnB4cjAwIn0.demo';

export default function MapboxMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(realEstateData.features);

  useEffect(() => {
    if (map.current) return;

    // إنشاء الخريطة
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [45.0, 24.0], // مركز السعودية
      zoom: 5.5,
      pitch: 45,
      bearing: 0,
      antialias: true
    });

    // إضافة عناصر التحكم
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // عند تحميل الخريطة
    map.current.on('load', () => {
      // إضافة طبقة 3D للمباني
      const layers = map.current.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
      ).id;

      map.current.addLayer(
        {
          'id': 'add-3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      );

      // إضافة مصدر البيانات العقارية
      map.current.addSource('real-estate', {
        type: 'geojson',
        data: realEstateData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // طبقة التجمعات (Clusters)
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'real-estate',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            5,
            '#f1f075',
            10,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            5,
            30,
            10,
            40
          ]
        }
      });

      // عدد النقاط في التجمع
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'real-estate',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });

      // النقاط الفردية
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'real-estate',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'trend'],
            'صاعد', '#10b981',
            'مستقر', '#6b7280',
            'هابط', '#ef4444',
            '#3b82f6'
          ],
          'circle-radius': 12,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      // عند الضغط على تجمع
      map.current.on('click', 'clusters', (e) => {
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.current.getSource('real-estate').getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err) return;
            map.current.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom
            });
          }
        );
      });

      // عند الضغط على نقطة
      map.current.on('click', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;

        setSelectedLocation(properties);
        setAiAnalysis(null);

        // تكبير على الموقع
        map.current.flyTo({
          center: coordinates,
          zoom: 14,
          pitch: 60,
          bearing: 0,
          duration: 2000
        });
      });

      // تغيير المؤشر عند التحويم
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

      // Tooltip عند التحويم
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });

      map.current.on('mouseenter', 'unclustered-point', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const props = e.features[0].properties;

        popup
          .setLngLat(coordinates)
          .setHTML(`
            <div style="padding: 8px; min-width: 200px; direction: rtl; text-align: right;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${props.district}</h3>
              <p style="margin: 4px 0; font-size: 12px;"><strong>المدينة:</strong> ${props.city}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>السعر:</strong> ${props.avgPrice.toLocaleString()} ريال/م²</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>الاتجاه:</strong> ${props.trend} (${props.growth > 0 ? '+' : ''}${props.growth}%)</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>الثقة:</strong> ${props.confidence}%</p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #666;">اضغط للتفاصيل</p>
            </div>
          `)
          .addTo(map.current);
      });

      map.current.on('mouseleave', 'unclustered-point', () => {
        popup.remove();
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // البحث والتصفية
  useEffect(() => {
    if (!searchQuery) {
      setFilteredData(realEstateData.features);
      return;
    }

    const filtered = realEstateData.features.filter(feature => {
      const props = feature.properties;
      const query = searchQuery.toLowerCase();
      return (
        props.city.toLowerCase().includes(query) ||
        props.district.toLowerCase().includes(query) ||
        props.region.toLowerCase().includes(query)
      );
    });

    setFilteredData(filtered);
  }, [searchQuery]);

  // تحليل GPT
  const analyzeWithAI = async () => {
    if (!selectedLocation) return;

    setLoading(true);
    try {
      const response = await fetch('/api/analyze-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: selectedLocation })
      });

      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data);
      } else {
        setAiAnalysis({
          summary: 'عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي.',
          recommendation: 'يرجى المحاولة لاحقاً',
          reason: '',
          forecast: '',
          score: 0
        });
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
      setAiAnalysis({
        summary: 'عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي.',
        recommendation: 'يرجى المحاولة لاحقاً',
        reason: '',
        forecast: '',
        score: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* الخريطة */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* شريط البحث */}
      <div className="absolute top-4 left-4 right-4 md:left-auto md:w-96 z-10">
        <input
          type="text"
          placeholder="ابحث عن مدينة أو حي..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg shadow-lg border-0 focus:ring-2 focus:ring-blue-500 text-right"
        />
      </div>

      {/* لوحة التفاصيل */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:w-96 bg-white rounded-lg shadow-2xl p-6 z-10 max-h-[70vh] overflow-y-auto">
          <button
            onClick={() => setSelectedLocation(null)}
            className="absolute top-2 left-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>

          <h2 className="text-xl font-bold mb-2 text-right">{selectedLocation.district}</h2>
          <p className="text-sm text-gray-600 mb-4 text-right">{selectedLocation.city} • {selectedLocation.region}</p>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-blue-600">{selectedLocation.avgPrice.toLocaleString()} ريال/م²</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                selectedLocation.trend === 'صاعد' ? 'bg-green-100 text-green-800' :
                selectedLocation.trend === 'هابط' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {selectedLocation.trend} {selectedLocation.growth > 0 ? '+' : ''}{selectedLocation.growth}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded text-right">
                <div className="text-gray-600">العينات</div>
                <div className="font-bold">{selectedLocation.samples}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded text-right">
                <div className="text-gray-600">الثقة</div>
                <div className="font-bold">{selectedLocation.confidence}%</div>
              </div>
            </div>

            <div className="text-sm text-gray-700 text-right">
              <strong>الوصف:</strong> {selectedLocation.description}
            </div>

            <div className="text-sm text-gray-700 text-right">
              <strong>المرافق:</strong> {JSON.parse(selectedLocation.amenities).join(' • ')}
            </div>
          </div>

          <button
            onClick={analyzeWithAI}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
          >
            {loading ? '🤖 جاري التحليل...' : '🤖 تحليل بالذكاء الاصطناعي'}
          </button>

          {aiAnalysis && (
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h3 className="font-bold mb-2 text-right">📊 تحليل الذكاء الاصطناعي</h3>
              <div className="space-y-2 text-sm text-right">
                <p><strong>الملخص:</strong> {aiAnalysis.summary}</p>
                <p><strong>التوصية:</strong> {aiAnalysis.recommendation}</p>
                {aiAnalysis.reason && <p><strong>السبب:</strong> {aiAnalysis.reason}</p>}
                {aiAnalysis.forecast && <p><strong>التوقعات:</strong> {aiAnalysis.forecast}</p>}
                {aiAnalysis.score > 0 && (
                  <div className="mt-2">
                    <strong>التقييم:</strong>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${aiAnalysis.score}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{aiAnalysis.score}/100</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* دليل الألوان */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10 text-right">
        <h3 className="font-bold mb-2 text-sm">دليل الألوان</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2 justify-end">
            <span>صاعد</span>
            <div className="w-4 h-4 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span>مستقر</span>
            <div className="w-4 h-4 rounded-full bg-gray-500" />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span>هابط</span>
            <div className="w-4 h-4 rounded-full bg-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

