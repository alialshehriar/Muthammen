import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { saudiLocations } from '../data/saudi_locations';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiYWxpYWxzaGVocmlhciIsImEiOiJjbWdvemtkbzEwOHltMmlxdHh3M3l1cHBhIn0.c-t3RizZIPUwOr3ZTb2Ijw';

// دالة لإنشاء polygon دائري حول نقطة
function createCirclePolygon(center, radiusInKm, points = 32) {
  const coords = [];
  const distanceX = radiusInKm / (111.32 * Math.cos(center[1] * Math.PI / 180));
  const distanceY = radiusInKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([center[0] + x, center[1] + y]);
  }
  coords.push(coords[0]); // إغلاق الدائرة
  return coords;
}

// دالة لتحديد اللون حسب السعر
function getPriceColor(price) {
  if (price < 1500) return '#10b981'; // أخضر - رخيص
  if (price < 2500) return '#3b82f6'; // أزرق - متوسط
  if (price < 3500) return '#f59e0b'; // برتقالي - مرتفع
  return '#ef4444'; // أحمر - غالي جداً
}

export default function PolygonMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loading, setLoading] = useState(true);
  const [is3D, setIs3D] = useState(false);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [46.7, 24.7],
        zoom: 5.5,
        pitch: 0,
        bearing: 0
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-left');

      map.current.on('load', () => {
        setLoading(false);
        addPolygons();
        add3DBuildings();
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
      if (map.current) map.current.remove();
    };
  }, []);

  const add3DBuildings = () => {
    if (!map.current) return;

    const layers = map.current.getStyle().layers;
    const labelLayerId = layers.find(
      (layer) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
    )?.id;

    if (!labelLayerId) return;

    try {
      map.current.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 13,
          paint: {
            'fill-extrusion-color': '#aaa',
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
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      );
    } catch (error) {
      console.error('Error adding 3D buildings:', error);
    }
  };

  const addPolygons = () => {
    if (!map.current) return;

    // إنشاء GeoJSON للمناطق
    const features = saudiLocations.map((location, index) => ({
      type: 'Feature',
      id: index,
      properties: {
        ...location,
        color: getPriceColor(location.price)
      },
      geometry: {
        type: 'Polygon',
        coordinates: [createCirclePolygon(location.coords, 2)] // نصف قطر 2 كم
      }
    }));

    const geojson = {
      type: 'FeatureCollection',
      features: features
    };

    // إضافة المصدر
    map.current.addSource('areas', {
      type: 'geojson',
      data: geojson
    });

    // طبقة التعبئة
    map.current.addLayer({
      id: 'areas-fill',
      type: 'fill',
      source: 'areas',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.7,
          0.4
        ]
      }
    });

    // طبقة الحدود
    map.current.addLayer({
      id: 'areas-outline',
      type: 'line',
      source: 'areas',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          3,
          1
        ]
      }
    });

    // طبقة الأسماء
    map.current.addLayer({
      id: 'areas-labels',
      type: 'symbol',
      source: 'areas',
      layout: {
        'text-field': ['get', 'district'],
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'text-anchor': 'center'
      },
      paint: {
        'text-color': '#1e293b',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    });

    // التفاعل عند التحويم
    let hoveredFeatureId = null;

    map.current.on('mousemove', 'areas-fill', (e) => {
      if (e.features.length > 0) {
        if (hoveredFeatureId !== null) {
          map.current.setFeatureState(
            { source: 'areas', id: hoveredFeatureId },
            { hover: false }
          );
        }
        hoveredFeatureId = e.features[0].id;
        map.current.setFeatureState(
          { source: 'areas', id: hoveredFeatureId },
          { hover: true }
        );

        map.current.getCanvas().style.cursor = 'pointer';
        setHoveredLocation(e.features[0].properties);
      }
    });

    map.current.on('mouseleave', 'areas-fill', () => {
      if (hoveredFeatureId !== null) {
        map.current.setFeatureState(
          { source: 'areas', id: hoveredFeatureId },
          { hover: false }
        );
      }
      hoveredFeatureId = null;
      map.current.getCanvas().style.cursor = '';
      setHoveredLocation(null);
    });

    // النقر على المنطقة
    map.current.on('click', 'areas-fill', (e) => {
      if (e.features.length > 0) {
        const properties = e.features[0].properties;
        setSelectedLocation(properties);
        
        // تحويل الإحداثيات من string إلى array
        const coords = JSON.parse(properties.coords || '[46.7, 24.7]');
        
        map.current.flyTo({
          center: coords,
          zoom: 13,
          duration: 1500
        });
      }
    });
  };

  const toggle3D = () => {
    if (!map.current) return;

    if (is3D) {
      map.current.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000
      });
    } else {
      map.current.easeTo({
        pitch: 60,
        bearing: -17.6,
        duration: 1000
      });
    }
    setIs3D(!is3D);
  };

  const flyToCity = (cityName) => {
    const cityLocations = saudiLocations.filter(loc => loc.city === cityName);
    if (cityLocations.length === 0 || !map.current) return;

    const firstLocation = cityLocations[0];
    map.current.flyTo({
      center: firstLocation.coords,
      zoom: 11,
      duration: 2000
    });
  };

  const displayLocation = selectedLocation || hoveredLocation;

  // تحويل facilities من string إلى array إذا لزم الأمر
  const getFacilities = (loc) => {
    if (!loc) return [];
    if (Array.isArray(loc.facilities)) return loc.facilities;
    try {
      return JSON.parse(loc.facilities || '[]');
    } catch {
      return [];
    }
  };

  return (
    <div className="split-map-container">
      <div className="map-section">
        <div ref={mapContainer} className="map" />

        <div className="map-controls">
          <button
            onClick={toggle3D}
            className={`control-btn ${is3D ? 'active' : ''}`}
            title={is3D ? 'إيقاف 3D' : 'تفعيل 3D'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <span>3D</span>
          </button>
        </div>

        <div className="cities-bar">
          {['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة'].map(city => (
            <button
              key={city}
              onClick={() => flyToCity(city)}
              className="city-btn"
            >
              {city}
            </button>
          ))}
        </div>

        <div className="legend">
          <div className="legend-title">دليل الأسعار</div>
          <div className="legend-item">
            <div className="legend-color" style={{background: '#10b981'}}></div>
            <span>أقل من 1,500 ريال</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{background: '#3b82f6'}}></div>
            <span>1,500 - 2,500 ريال</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{background: '#f59e0b'}}></div>
            <span>2,500 - 3,500 ريال</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{background: '#ef4444'}}></div>
            <span>أكثر من 3,500 ريال</span>
          </div>
        </div>

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>جاري تحميل الخريطة...</p>
          </div>
        )}
      </div>

      <div className="info-panel">
        <div className="info-header">
          <h2>معلومات الموقع</h2>
          <p className="info-subtitle">
            {displayLocation ? 'مرر على المناطق لعرض التفاصيل' : 'حدد منطقة على الخريطة'}
          </p>
        </div>

        {displayLocation ? (
          <div className="location-details">
            <div className="location-header">
              <h3>{displayLocation.district}</h3>
              <p className="city">{displayLocation.city}</p>
            </div>

            <div className="price-section">
              <div className="price-label">السعر للمتر المربع</div>
              <div className="price-value">
                {typeof displayLocation.price === 'string' 
                  ? displayLocation.price 
                  : displayLocation.price.toLocaleString()} ريال
              </div>
            </div>

            <div className="details-grid">
              <div className="detail-card">
                <div className="detail-label">الاتجاه</div>
                <div className={`detail-value trend-${displayLocation.trend}`}>
                  {displayLocation.trend === 'صاعد' && '↗'}
                  {displayLocation.trend === 'هابط' && '↘'}
                  {displayLocation.trend === 'مستقر' && '→'}
                  <span>{displayLocation.trend}</span>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-label">التقييم</div>
                <div className="detail-value rating">
                  <span className="stars">
                    {'★'.repeat(Math.round(parseFloat(displayLocation.rating) || 0))}
                  </span>
                  <span>{displayLocation.rating}/5</span>
                </div>
              </div>
            </div>

            <div className="facilities-section">
              <div className="section-title">المرافق المتوفرة</div>
              <div className="facilities-list">
                {getFacilities(displayLocation).map((facility, index) => (
                  <div key={index} className="facility-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <p>مرر على المناطق الملونة لعرض التفاصيل</p>
          </div>
        )}
      </div>

      <style>{`
        .split-map-container {
          display: flex;
          height: 100vh;
          font-family: 'Cairo', 'Noto Sans Arabic', sans-serif;
          direction: rtl;
        }

        .map-section {
          flex: 1;
          position: relative;
        }

        .map {
          width: 100%;
          height: 100%;
        }

        .map-controls {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 10;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
        }

        .control-btn:hover {
          background: #f1f5f9;
          color: #2563eb;
        }

        .control-btn.active {
          background: #2563eb;
          color: white;
        }

        .cities-bar {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 10px;
          z-index: 10;
        }

        .city-btn {
          padding: 10px 20px;
          background: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #1e40af;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
        }

        .city-btn:hover {
          background: #2563eb;
          color: white;
          transform: translateY(-2px);
        }

        .legend {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: white;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }

        .legend-title {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 12px;
          color: #475569;
        }

        .legend-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }

        .info-panel {
          width: 400px;
          background: white;
          border-left: 1px solid #e5e7eb;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .info-header {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        }

        .info-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 700;
          color: #1e40af;
        }

        .info-subtitle {
          margin: 0;
          font-size: 14px;
          color: #64748b;
        }

        .location-details {
          padding: 24px;
          flex: 1;
        }

        .location-header h3 {
          margin: 0 0 4px 0;
          font-size: 22px;
          font-weight: 700;
          color: #1e293b;
        }

        .location-header .city {
          margin: 0 0 20px 0;
          font-size: 16px;
          color: #64748b;
        }

        .price-section {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .price-label {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 8px;
        }

        .price-value {
          font-size: 28px;
          font-weight: 700;
          color: #2563eb;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .detail-card {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
        }

        .detail-label {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 8px;
        }

        .detail-value {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .detail-value.trend-صاعد {
          color: #10b981;
        }

        .detail-value.trend-هابط {
          color: #ef4444;
        }

        .detail-value.trend-مستقر {
          color: #64748b;
        }

        .detail-value.rating {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }

        .stars {
          color: #f59e0b;
          font-size: 18px;
        }

        .facilities-section {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 12px;
        }

        .facilities-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .facility-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          background: #f1f5f9;
          border-radius: 6px;
          font-size: 14px;
          color: #475569;
        }

        .facility-item svg {
          color: #10b981;
        }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
          color: #94a3b8;
        }

        .empty-state svg {
          margin-bottom: 16px;
        }

        .empty-state p {
          font-size: 16px;
          line-height: 1.5;
        }

        .loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e5e7eb;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-overlay p {
          margin-top: 16px;
          font-size: 16px;
          font-weight: 600;
          color: #1e40af;
        }

        .mapboxgl-ctrl-attrib {
          display: none;
        }

        @media (max-width: 1024px) {
          .split-map-container {
            flex-direction: column;
          }

          .info-panel {
            width: 100%;
            height: 300px;
            border-left: none;
            border-top: 1px solid #e5e7eb;
          }

          .cities-bar {
            top: auto;
            bottom: 20px;
          }

          .legend {
            bottom: auto;
            top: 80px;
          }
        }
      `}</style>
    </div>
  );
}

