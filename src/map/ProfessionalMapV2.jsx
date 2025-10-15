import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { saudiLocations } from '../data/saudi_locations';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiYWxpYWxzaGVocmlhciIsImEiOiJjbWdvemtkbzEwOHltMmlxdHh3M3l1cHBhIn0.c-t3RizZIPUwOr3ZTb2Ijw';

export default function ProfessionalMapV2() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const [loading, setLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState('streets');
  const [is3D, setIs3D] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // تهيئة الخريطة
  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [46.7, 24.7],
        zoom: 5.5,
        pitch: 0,
        bearing: 0
      });

      // إضافة أدوات التحكم
      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-left');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'bottom-left');

      map.current.on('load', () => {
        setLoading(false);
        addMarkers();
        
        // إضافة طبقة المباني 3D
        const layers = map.current.getStyle().layers;
        const labelLayerId = layers.find(
          (layer) => layer.type === 'symbol' && layer.layout['text-field']
        )?.id;

        if (labelLayerId) {
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
        }
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
      // إنشاء علامة بسيطة ورسمية
      const el = document.createElement('div');
      el.className = 'map-marker';
      el.innerHTML = `
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="#2563eb"/>
          <circle cx="12" cy="12" r="6" fill="white"/>
        </svg>
      `;
      el.style.cssText = `
        cursor: pointer;
        transition: transform 0.2s;
      `;

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // إنشاء Popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        className: 'location-popup'
      }).setHTML(`
        <div class="popup-content">
          <h3>${location.district}</h3>
          <p class="city">${location.city}</p>
          
          <div class="price-box">
            <span class="label">السعر</span>
            <span class="value">${location.price.toLocaleString()} ريال/م²</span>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="label">الاتجاه</span>
              <span class="value trend-${location.trend}">${location.trend}</span>
            </div>
            <div class="info-item">
              <span class="label">التقييم</span>
              <span class="value">${location.rating}/5</span>
            </div>
          </div>

          <div class="facilities">
            ${location.facilities.map(f => `<span class="facility">${f}</span>`).join('')}
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat(location.coords)
        .setPopup(popup)
        .addTo(map.current);

      markers.current.push(marker);
    });
  };

  // تبديل 3D
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

  // تغيير نمط الخريطة
  const changeStyle = (style) => {
    if (!map.current) return;

    const styles = {
      streets: 'mapbox://styles/mapbox/streets-v12',
      satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
      light: 'mapbox://styles/mapbox/light-v11'
    };

    map.current.setStyle(styles[style]);
    setMapStyle(style);

    map.current.once('styledata', () => {
      addMarkers();
      
      // إعادة إضافة طبقة 3D
      const layers = map.current.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
      )?.id;

      if (labelLayerId) {
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
      }
    });
  };

  // الانتقال إلى مدينة
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

  return (
    <div className="map-container">
      {/* الخريطة */}
      <div ref={mapContainer} className="map" />

      {/* أدوات التحكم */}
      <div className="map-controls">
        {/* أزرار الأنماط */}
        <div className="control-group">
          <button
            onClick={() => changeStyle('streets')}
            className={`control-btn ${mapStyle === 'streets' ? 'active' : ''}`}
            title="خريطة الشوارع"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </button>

          <button
            onClick={() => changeStyle('satellite')}
            className={`control-btn ${mapStyle === 'satellite' ? 'active' : ''}`}
            title="قمر صناعي"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </button>

          <button
            onClick={() => changeStyle('light')}
            className={`control-btn ${mapStyle === 'light' ? 'active' : ''}`}
            title="وضع فاتح"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </button>
        </div>

        {/* زر 3D */}
        <div className="control-group">
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
          </button>
        </div>
      </div>

      {/* المدن الرئيسية */}
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

      {/* شاشة التحميل */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>جاري تحميل الخريطة...</p>
        </div>
      )}

      <style>{`
        .map-container {
          position: relative;
          width: 100%;
          height: 100vh;
          font-family: 'Cairo', 'Noto Sans Arabic', sans-serif;
        }

        .map {
          width: 100%;
          height: 100%;
        }

        .map-controls {
          position: absolute;
          top: 20px;
          left: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 10;
        }

        .control-group {
          background: white;
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .control-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: white;
          color: #64748b;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
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
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
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

        /* Popup Styles */
        .location-popup .mapboxgl-popup-content {
          padding: 0;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          min-width: 280px;
        }

        .location-popup .mapboxgl-popup-close-button {
          font-size: 20px;
          padding: 8px;
          color: #64748b;
        }

        .popup-content {
          padding: 20px;
          direction: rtl;
        }

        .popup-content h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 700;
          color: #1e40af;
        }

        .popup-content .city {
          margin: 0 0 16px 0;
          font-size: 14px;
          color: #64748b;
        }

        .price-box {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .price-box .label {
          font-size: 13px;
          color: #64748b;
        }

        .price-box .value {
          font-size: 18px;
          font-weight: 700;
          color: #2563eb;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }

        .info-item {
          background: #f8fafc;
          padding: 10px;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-item .label {
          font-size: 11px;
          color: #94a3b8;
        }

        .info-item .value {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .info-item .value.trend-صاعد {
          color: #10b981;
        }

        .info-item .value.trend-هابط {
          color: #ef4444;
        }

        .info-item .value.trend-مستقر {
          color: #64748b;
        }

        .facilities {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .facility {
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          color: #475569;
        }

        .mapboxgl-ctrl-attrib {
          display: none;
        }

        @media (max-width: 768px) {
          .cities-bar {
            top: auto;
            bottom: 20px;
            right: 20px;
            flex-direction: column;
          }

          .map-controls {
            top: auto;
            bottom: 20px;
            left: 20px;
          }
        }
      `}</style>
    </div>
  );
}

