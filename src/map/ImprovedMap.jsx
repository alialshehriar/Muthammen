import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import riyadhNeighborhoods from '../data/riyadh_neighborhoods.geojson';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiYWxpYWxzaGVocmlhciIsImEiOiJjbWdvemtkbzEwOHltMmlxdHh3M3l1cHBhIn0.c-t3RizZIPUwOr3ZTb2Ijw';

export default function ImprovedMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [46.6753, 24.7136],
      zoom: 11.5,
      pitch: 45,
      bearing: 0
    });

    map.current.on('load', () => {
      // Add neighborhoods source with GeoJSON
      map.current.addSource('neighborhoods', {
        type: 'geojson',
        data: riyadhNeighborhoods
      });

      // Add fill layer with color based on price range
      map.current.addLayer({
        id: 'neighborhoods-fill',
        type: 'fill',
        source: 'neighborhoods',
        paint: {
          'fill-color': [
            'match',
            ['get', 'priceRange'],
            '1000-2000', '#22c55e',  // Green
            '2000-3000', '#3b82f6',  // Blue
            '3000-4000', '#f59e0b',  // Orange
            '4000+', '#ef4444',      // Red
            '#9ca3af'                // Default gray
          ],
          'fill-opacity': 0.6
        }
      });

      // Add border layer
      map.current.addLayer({
        id: 'neighborhoods-border',
        type: 'line',
        source: 'neighborhoods',
        paint: {
          'line-color': '#ffffff',
          'line-width': 2,
          'line-opacity': 0.8
        }
      });

      // Add labels
      map.current.addLayer({
        id: 'neighborhoods-labels',
        type: 'symbol',
        source: 'neighborhoods',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Arial Unicode MS Bold'],
          'text-size': 14,
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 2
        }
      });

      // Add price labels
      map.current.addLayer({
        id: 'neighborhoods-price',
        type: 'symbol',
        source: 'neighborhoods',
        layout: {
          'text-field': ['concat', ['to-string', ['get', 'price']], ' ر.س/م²'],
          'text-font': ['Arial Unicode MS Regular'],
          'text-size': 12,
          'text-anchor': 'center',
          'text-offset': [0, 1.5]
        },
        paint: {
          'text-color': '#ffff00',
          'text-halo-color': '#000000',
          'text-halo-width': 1.5
        }
      });

      // Add hover effect
      let hoveredId = null;

      map.current.on('mousemove', 'neighborhoods-fill', (e) => {
        if (e.features.length > 0) {
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
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'neighborhoods-fill', () => {
        if (hoveredId !== null) {
          map.current.setFeatureState(
            { source: 'neighborhoods', id: hoveredId },
            { hover: false }
          );
        }
        hoveredId = null;
        map.current.getCanvas().style.cursor = '';
      });

      // Add popup on click
      map.current.on('click', 'neighborhoods-fill', (e) => {
        const feature = e.features[0];
        const { name, price, trend, rating, priceRange } = feature.properties;
        
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="padding: 10px; font-family: Arial;">
              <h3 style="margin: 0 0 10px 0; color: #1f2937;">${name}</h3>
              <p style="margin: 5px 0;"><strong>السعر:</strong> ${price} ر.س/م²</p>
              <p style="margin: 5px 0;"><strong>النطاق:</strong> ${priceRange} ر.س/م²</p>
              <p style="margin: 5px 0;"><strong>الاتجاه:</strong> ${trend}</p>
              <p style="margin: 5px 0;"><strong>التقييم:</strong> ${rating} ⭐</p>
            </div>
          `)
          .addTo(map.current);
      });

      setLoading(false);
    });

    return () => map.current?.remove();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px' }}>
      {loading && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          background: 'white',
          padding: '20px',
          borderRadius: '8px'
        }}>
          جاري تحميل الخريطة...
        </div>
      )}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        zIndex: 1
      }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>دليل الأسعار (ريال/م²)</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: '#22c55e', borderRadius: '3px' }}></div>
            <span style={{ fontSize: '12px' }}>أقل من 2,000</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: '#3b82f6', borderRadius: '3px' }}></div>
            <span style={{ fontSize: '12px' }}>2,000 - 3,000</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: '#f59e0b', borderRadius: '3px' }}></div>
            <span style={{ fontSize: '12px' }}>3,000 - 4,000</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', background: '#ef4444', borderRadius: '3px' }}></div>
            <span style={{ fontSize: '12px' }}>أكثر من 4,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
