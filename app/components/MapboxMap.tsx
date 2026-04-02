'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const PINS = [
  { id: '1',  lat: 37.7749,  lng: -122.4194, title: 'Kung Pao Chicken',        cuisine: 'Chinese'   },
  { id: '2',  lat: 34.0522,  lng: -118.2437, title: 'Tacos al Pastor',          cuisine: 'Mexican'   },
  { id: '3',  lat: 40.7128,  lng: -74.0060,  title: 'Homemade Lasagna',         cuisine: 'Italian'   },
  { id: '4',  lat: 47.6062,  lng: -122.3321, title: 'Tonkotsu Ramen',           cuisine: 'Japanese'  },
  { id: '5',  lat: 41.8781,  lng: -87.6298,  title: 'Butter Chicken',           cuisine: 'Indian'    },
  { id: '6',  lat: 29.7604,  lng: -95.3698,  title: 'BBQ Brisket',              cuisine: 'American'  },
  { id: '7',  lat: 45.5051,  lng: -122.6750, title: 'Phở Bò',                   cuisine: 'Vietnamese'},
  { id: '8',  lat: 25.7617,  lng: -80.1918,  title: 'Green Curry',              cuisine: 'Thai'      },
  { id: '9',  lat: 47.6101,  lng: -122.2015, title: 'Kimchi Jjigae',            cuisine: 'Korean'    },
  { id: '10', lat: 38.9072,  lng: -77.0369,  title: 'Doro Wat',                 cuisine: 'Ethiopian' },
  { id: '11', lat: 41.8500,  lng: -87.6500,  title: 'Spanakopita',              cuisine: 'Greek'     },
  { id: '12', lat: 25.7800,  lng: -80.2100,  title: 'Lamb Kofta',               cuisine: 'Lebanese'  },
];

const FORK_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
  <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
</svg>`;

export default function MapboxMap() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<mapboxgl.Map | null>(null);
  const geoCtrlRef    = useRef<mapboxgl.GeolocateControl | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-98.5795, 39.8283],
      zoom: 3.5,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    // Built-in geolocation control (blue dot + heading arc)
    const geoCtrl = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: true,
    });
    map.addControl(geoCtrl, 'top-right');
    geoCtrlRef.current = geoCtrl;

    map.on('load', () => {
      PINS.forEach((pin) => {
        // Outer el: Mapbox owns the transform on this for positioning — never touch it
        const el = document.createElement('div');
        el.style.cssText = 'width:36px; height:36px; cursor:pointer;';

        // Inner el: safe to animate because Mapbox never touches it
        const inner = document.createElement('div');
        inner.style.cssText = `
          width:36px; height:36px; border-radius:50%;
          background-color:#1a3a2a; border:2.5px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.45);
          display:flex; align-items:center; justify-content:center;
          transition:transform 0.15s;
        `;
        inner.innerHTML = FORK_SVG;
        el.appendChild(inner);

        el.addEventListener('mouseenter', () => { inner.style.transform = 'scale(1.2)'; });
        el.addEventListener('mouseleave', () => { inner.style.transform = 'scale(1)'; });

        new mapboxgl.Marker({ element: el })
          .setLngLat([pin.lng, pin.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 20, closeButton: false, maxWidth: '180px' })
              .setHTML(
                `<div style="font-family:Inter,sans-serif;padding:4px 2px">
                   <div style="font-weight:600;font-size:13px;color:#1a3a2a">${pin.title}</div>
                   <div style="font-size:11px;color:#6b7280;margin-top:2px">${pin.cuisine}</div>
                 </div>`
              )
          )
          .addTo(map);
      });
    });

    return () => { map.remove(); mapRef.current = null; userMarkerRef.current = null; };
  }, []);

  function handleLocateMe() {
    setLocError(null);
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const map = mapRef.current;
        if (!map) return;

        // Remove previous user marker if any
        userMarkerRef.current?.remove();

        // Custom "you are here" marker
        const el = document.createElement('div');
        el.style.cssText = `
          width:20px; height:20px; border-radius:50%;
          background-color:#3b82f6; border:3px solid white;
          box-shadow:0 0 0 4px rgba(59,130,246,0.35);
        `;
        userMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 16, closeButton: false })
              .setHTML(`<div style="font-family:Inter,sans-serif;font-size:12px;font-weight:600;color:#1e40af">You are here</div>`)
          )
          .addTo(map);

        map.flyTo({ center: [lng, lat], zoom: 12, speed: 1.4 });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocError('Location access denied. Please allow it in browser settings.');
        } else {
          setLocError('Could not get your location.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Custom "Locate Me" button */}
      <button
        onClick={handleLocateMe}
        disabled={locating}
        title="Go to my location"
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '9999px',
          background: '#1a3a2a',
          color: 'white',
          fontSize: '13px',
          fontWeight: 600,
          border: '1.5px solid rgba(255,255,255,0.15)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
          cursor: locating ? 'wait' : 'pointer',
          opacity: locating ? 0.7 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        {locating ? (
          <>
            <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            Locating…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"/>
            </svg>
            Near me
          </>
        )}
      </button>

      {/* Error toast */}
      {locError && (
        <div style={{
          position: 'absolute',
          bottom: 72,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          background: '#7f1d1d',
          color: '#fecaca',
          fontSize: '12px',
          padding: '6px 14px',
          borderRadius: '8px',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}>
          {locError}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
