import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import realEstateData from '../data/map/saudi_real_estate_complete.json';

// Mapbox Access Token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiYWxpYWxzaGVocmlhciIsImEiOiJjbWdvemtkbzEwOHltMmlxdHh3M3l1cHBhIn0.c-t3RizZIPUwOr3ZTb2Ijw';
mapboxgl.accessToken = MAPBOX_TOKEN;

export default function EpicMapView() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('3d'); // '3d', 'heatmap', 'clusters'
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (map.current) return;

    // إنشاء الخريطة الأسطورية
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: darkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12',
      center: [45.0, 24.0],
      zoom: 5.5,
      pitch: 60,
      bearing: -17.6,
      antialias: true,
      attributionControl: false
    });

    // إضافة عناصر التحكم
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    }), 'top-right');

    // عند تحميل الخريطة
    map.current.on('load', () => {
      // إضافة طبقة 3D للمباني
      addBuildingLayer();
      
      // إضافة مصدر البيانات العقارية
      map.current.addSource('real-estate', {
        type: 'geojson',
        data: realEstateData,
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50,
        clusterProperties: {
          avgPrice: ['/', ['+', ['get', 'avgPrice']], ['get', 'point_count']],
          maxPrice: ['max', ['get', 'avgPrice']],
          minPrice: ['min', ['get', 'avgPrice']]
        }
      });

      // طبقة Heat Map
      map.current.addLayer({
        id: 'heatmap-layer',
        type: 'heatmap',
        source: 'real-estate',
        maxzoom: 15,
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'avgPrice'],
            1000, 0,
            5000, 1
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            15, 3
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            15, 20
          ],
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 0.8,
            15, 0.6
          ]
        },
        layout: {
          visibility: viewMode === 'heatmap' ? 'visible' : 'none'
        }
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
            ['get', 'avgPrice'],
            '#51bbd6',
            2000, '#f1f075',
            3000, '#f28cb1',
            4000, '#e55e5e'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, 5,
            30, 10,
            40, 20,
            50
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#fff',
          'circle-opacity': 0.8
        },
        layout: {
          visibility: viewMode === 'clusters' ? 'visible' : 'none'
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
          'text-size': 14,
          visibility: viewMode === 'clusters' ? 'visible' : 'none'
        },
        paint: {
          'text-color': '#ffffff'
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
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5, 6,
            10, 12,
            15, 20
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
          'circle-opacity': 0.9
        }
      });

      // طبقة الأيقونات
      map.current.addLayer({
        id: 'point-labels',
        type: 'symbol',
        source: 'real-estate',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['get', 'district'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 11,
          'text-offset': [0, 1.5],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': darkMode ? '#ffffff' : '#000000',
          'text-halo-color': darkMode ? '#000000' : '#ffffff',
          'text-halo-width': 1
        }
      });

      // التفاعلات
      setupInteractions();
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // تحديث الوضع الليلي
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(darkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12');
  }, [darkMode]);

  // تحديث وضع العرض
  useEffect(() => {
    if (!map.current) return;
    
    const layers = {
      heatmap: ['heatmap-layer'],
      clusters: ['clusters', 'cluster-count'],
      '3d': []
    };

    // إخفاء جميع الطبقات
    Object.values(layers).flat().forEach(layerId => {
      if (map.current.getLayer(layerId)) {
        map.current.setLayoutProperty(layerId, 'visibility', 'none');
      }
    });

    // إظهار الطبقات المطلوبة
    if (layers[viewMode]) {
      layers[viewMode].forEach(layerId => {
        if (map.current.getLayer(layerId)) {
          map.current.setLayoutProperty(layerId, 'visibility', 'visible');
        }
      });
    }
  }, [viewMode]);

  const addBuildingLayer = () => {
    const layers = map.current.getStyle().layers;
    const labelLayerId = layers.find(
      (layer) => layer.type === 'symbol' && layer.layout['text-field']
    )?.id;

    if (labelLayerId) {
      map.current.addLayer(
        {
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': [
              'interpolate',
              ['linear'],
              ['get', 'height'],
              0, '#e0e0e0',
              50, '#b0b0b0',
              100, '#808080'
            ],
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15, 0,
              15.05, ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15, 0,
              15.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.8
          }
        },
        labelLayerId
      );
    }
  };

  const setupInteractions = () => {
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
            zoom: zoom + 1,
            duration: 1000
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

      // طيران سينمائي إلى الموقع
      map.current.flyTo({
        center: coordinates,
        zoom: 15,
        pitch: 60,
        bearing: Math.random() * 360,
        duration: 2500,
        essential: true
      });
    });

    // تغيير المؤشر
    ['clusters', 'unclustered-point'].forEach(layer => {
      map.current.on('mouseenter', layer, () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', layer, () => {
        map.current.getCanvas().style.cursor = '';
      });
    });

    // Tooltip عند التحويم
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 15
    });

    map.current.on('mouseenter', 'unclustered-point', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const props = e.features[0].properties;

      const trendEmoji = props.trend === 'صاعد' ? '📈' : props.trend === 'هابط' ? '📉' : '➡️';
      const investmentColor = props.investment === 'عالي جداً' || props.investment === 'عالي' ? '#10b981' : 
                              props.investment === 'متوسط' ? '#f59e0b' : '#ef4444';

      popup
        .setLngLat(coordinates)
        .setHTML(`
          <div style="padding: 12px; min-width: 250px; direction: rtl; text-align: right; font-family: 'Cairo', sans-serif;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #1e40af;">${props.district}</h3>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px; border-radius: 8px; margin-bottom: 10px;">
              <p style="margin: 0; font-size: 18px; font-weight: bold;">${props.avgPrice.toLocaleString()} ريال/م²</p>
            </div>
            <p style="margin: 4px 0; font-size: 13px;"><strong>المدينة:</strong> ${props.city}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>الاتجاه:</strong> ${trendEmoji} ${props.trend} (${props.growth > 0 ? '+' : ''}${props.growth}%)</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>الثقة:</strong> ${props.confidence}%</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>الاستثمار:</strong> <span style="color: ${investmentColor}; font-weight: bold;">${props.investment}</span></p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>الجودة:</strong> ${props.quality}</p>
            <hr style="margin: 8px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="margin: 8px 0 0 0; font-size: 11px; color: #6b7280; text-align: center;">🖱️ اضغط للتفاصيل والتحليل الذكي</p>
          </div>
        `)
        .addTo(map.current);
    });

    map.current.on('mouseleave', 'unclustered-point', () => {
      popup.remove();
    });
  };

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
          summary: '🤖 التحليل الذكي متاح قريباً',
          recommendation: 'استخدم البيانات المعروضة للتقييم',
          reason: 'جاري تطوير نظام التحليل المتقدم',
          forecast: 'ستتوفر التوقعات قريباً',
          score: 75
        });
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
      setAiAnalysis({
        summary: '🤖 التحليل الذكي متاح قريباً',
        recommendation: 'استخدم البيانات المعروضة للتقييم',
        reason: 'جاري تطوير نظام التحليل المتقدم',
        forecast: 'ستتوفر التوقعات قريباً',
        score: 75
      });
    } finally {
      setLoading(false);
    }
  };

  // البحث
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
        pitch: 60,
        duration: 2000
      });
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* الخريطة */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* شريط التحكم العلوي */}
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-4 flex-wrap">
        {/* البحث */}
        <input
          type="text"
          placeholder="🔍 ابحث عن مدينة أو حي..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 min-w-[250px] px-4 py-3 rounded-xl shadow-2xl border-0 focus:ring-2 focus:ring-blue-500 text-right bg-white/95 backdrop-blur-sm"
        />

        {/* أزرار وضع العرض */}
        <div className="flex gap-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-2">
          <button
            onClick={() => setViewMode('3d')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              viewMode === '3d' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🏢 3D
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              viewMode === 'heatmap' 
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔥 حراري
          </button>
          <button
            onClick={() => setViewMode('clusters')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              viewMode === 'clusters' 
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📍 تجمعات
          </button>
        </div>

        {/* الوضع الليلي */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-4 py-2 rounded-xl shadow-2xl bg-white/95 backdrop-blur-sm hover:bg-gray-100 transition-all"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* لوحة التفاصيل */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:w-[420px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 z-10 max-h-[75vh] overflow-y-auto">
          <button
            onClick={() => setSelectedLocation(null)}
            className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all"
          >
            ✕
          </button>

          <div className="text-right">
            <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {selectedLocation.district}
            </h2>
            <p className="text-sm text-gray-600 mb-4">{selectedLocation.city} • {selectedLocation.region}</p>

            {/* السعر الرئيسي */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl mb-4 shadow-lg">
              <div className="text-center">
                <p className="text-sm opacity-90 mb-1">السعر المتوسط</p>
                <p className="text-4xl font-bold">{selectedLocation.avgPrice.toLocaleString()}</p>
                <p className="text-sm opacity-90">ريال/م²</p>
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t border-white/20 text-sm">
                <div>
                  <p className="opacity-75">الأدنى</p>
                  <p className="font-bold">{selectedLocation.minPrice.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="opacity-75">الاتجاه</p>
                  <p className="font-bold">{selectedLocation.trend} {selectedLocation.growth > 0 ? '+' : ''}{selectedLocation.growth}%</p>
                </div>
                <div className="text-right">
                  <p className="opacity-75">الأعلى</p>
                  <p className="font-bold">{selectedLocation.maxPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* المعلومات */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <p className="text-xs text-gray-600 mb-1">مستوى الثقة</p>
                <p className="text-2xl font-bold text-green-600">{selectedLocation.confidence}%</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">عدد العينات</p>
                <p className="text-2xl font-bold text-blue-600">{selectedLocation.samples}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <p className="text-xs text-gray-600 mb-1">الجودة</p>
                <p className="text-lg font-bold text-purple-600">{selectedLocation.quality}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
                <p className="text-xs text-gray-600 mb-1">الاستثمار</p>
                <p className="text-lg font-bold text-orange-600">{selectedLocation.investment}</p>
              </div>
            </div>

            {/* الوصف */}
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">{selectedLocation.description}</p>
            </div>

            {/* المرافق */}
            <div className="mb-4">
              <p className="text-sm font-bold text-gray-700 mb-2">🏪 المرافق القريبة:</p>
              <div className="flex flex-wrap gap-2">
                {JSON.parse(selectedLocation.amenities).map((amenity, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* زر التحليل */}
            <button
              onClick={analyzeWithAI}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? '🤖 جاري التحليل الذكي...' : '🤖 تحليل بالذكاء الاصطناعي'}
            </button>

            {/* نتيجة التحليل */}
            {aiAnalysis && (
              <div className="mt-4 p-5 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl border-2 border-blue-200 shadow-lg">
                <h3 className="font-bold mb-3 text-lg flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    تحليل الذكاء الاصطناعي
                  </span>
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-white/70 p-3 rounded-lg">
                    <p className="font-bold text-gray-700 mb-1">📊 الملخص:</p>
                    <p className="text-gray-600">{aiAnalysis.summary}</p>
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg">
                    <p className="font-bold text-gray-700 mb-1">💡 التوصية:</p>
                    <p className="text-gray-600">{aiAnalysis.recommendation}</p>
                  </div>
                  {aiAnalysis.reason && (
                    <div className="bg-white/70 p-3 rounded-lg">
                      <p className="font-bold text-gray-700 mb-1">🎯 السبب:</p>
                      <p className="text-gray-600">{aiAnalysis.reason}</p>
                    </div>
                  )}
                  {aiAnalysis.forecast && (
                    <div className="bg-white/70 p-3 rounded-lg">
                      <p className="font-bold text-gray-700 mb-1">🔮 التوقعات:</p>
                      <p className="text-gray-600">{aiAnalysis.forecast}</p>
                    </div>
                  )}
                  {aiAnalysis.score > 0 && (
                    <div className="bg-white/70 p-3 rounded-lg">
                      <p className="font-bold text-gray-700 mb-2">⭐ التقييم الكلي:</p>
                      <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${aiAnalysis.score}%` }}
                        />
                      </div>
                      <p className="text-center mt-1 font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {aiAnalysis.score}/100
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* دليل الألوان */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 z-10 text-right">
        <h3 className="font-bold mb-3 text-sm text-gray-800">📌 دليل الألوان</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-gray-700">صاعد (نمو إيجابي)</span>
            <div className="w-5 h-5 rounded-full bg-green-500 shadow-md" />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-gray-700">مستقر (ثابت)</span>
            <div className="w-5 h-5 rounded-full bg-gray-500 shadow-md" />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-gray-700">هابط (نمو سلبي)</span>
            <div className="w-5 h-5 rounded-full bg-red-500 shadow-md" />
          </div>
        </div>
      </div>

      {/* شعار مُثمّن */}
      <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl px-6 py-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          مُثمّن
        </h1>
        <p className="text-xs text-gray-600">خريطة الوعي العقاري</p>
      </div>
    </div>
  );
}

