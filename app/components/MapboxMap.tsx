'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const PINS = [
  { id: '00000000-0000-4001-8000-000000000001', lat: 37.7749,  lng: -122.4194, title: 'Sourdough Starter Bread',  category: 'Baked Goods',        cook: 'Mei L.',    qty: 4, price: 450  },
  { id: '00000000-0000-4001-8000-000000000002', lat: 34.0522,  lng: -118.2437, title: 'Horchata Rice Cookies',    category: 'Cookies & Biscuits', cook: 'Carlos R.', qty: 8, price: 500  },
  { id: '00000000-0000-4001-8000-000000000003', lat: 40.7128,  lng: -74.0060,  title: 'Rosemary Olive Focaccia', category: 'Baked Goods',        cook: 'Sofia M.',  qty: 2, price: 800  },
  { id: '00000000-0000-4001-8000-000000000004', lat: 47.6062,  lng: -122.3321, title: 'Miso Caramel Granola',    category: 'Dried & Packaged',   cook: 'Kenji T.',  qty: 5, price: 750  },
  { id: '00000000-0000-4001-8000-000000000005', lat: 41.8781,  lng: -87.6298,  title: 'Cardamom Honey Cake',     category: 'Baked Goods',        cook: 'Priya S.',  qty: 6, price: 650  },
  { id: '00000000-0000-4001-8000-000000000006', lat: 29.7604,  lng: -95.3698,  title: 'Peach Jalapeño Jam',      category: 'Jams & Preserves',   cook: 'Jake W.',   qty: 3, price: 0    },
  { id: '00000000-0000-4001-8000-000000000007', lat: 45.5051,  lng: -122.6750, title: 'Vegan Kimchi',            category: 'Fermented',          cook: 'Linh N.',   qty: 7, price: 0    },
  { id: '00000000-0000-4001-8000-000000000008', lat: 25.7617,  lng: -80.1918,  title: 'Mango Coconut Mochi',     category: 'Asian Sweets',       cook: 'Nong P.',   qty: 4, price: 599  },
  { id: '00000000-0000-4001-8000-000000000009', lat: 47.6101,  lng: -122.2015, title: 'Sesame Peanut Brittle',   category: 'Confections',        cook: 'Jisu K.',   qty: 5, price: 0    },
  { id: '00000000-0000-4001-8000-000000000010', lat: 38.9072,  lng: -77.0369,  title: 'Berbere Spice Blend',     category: 'Dried & Packaged',   cook: 'Hana G.',   qty: 2, price: 800  },
  { id: '00000000-0000-4001-8000-000000000011', lat: 41.8500,  lng: -87.6500,  title: 'Baklava Rolls',           category: 'Confections',        cook: 'Elena V.',  qty: 9, price: 499  },
  { id: '00000000-0000-4001-8000-000000000012', lat: 25.7800,  lng: -80.2100,  title: 'Mamoul Date Cookies',     category: 'Cookies & Biscuits', cook: 'Omar F.',   qty: 3, price: 750  },
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
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const container = containerRef.current;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-98.5795, 39.8283],
      zoom: 3.5,
    });

    mapRef.current = map;

    // Auto-resize map whenever its container changes size (drag resize, fullscreen, etc.)
    const ro = new ResizeObserver(() => { map.resize(); });
    ro.observe(container);
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

    // Intercept "View Listing" anchor clicks inside popups — use Next.js router
    // so navigation is client-side and the router cache can restore the page on back
    const handleNavClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[data-internal]') as HTMLAnchorElement | null;
      if (a) {
        e.preventDefault();
        const href = a.getAttribute('href');
        if (href) router.push(href);
      }
    };
    container.addEventListener('click', handleNavClick);

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

        const priceLabel = pin.price === 0
          ? '<span style="color:#16a34a;font-weight:700">Free</span>'
          : `<span style="font-weight:700;color:#1a3a2a">$${(pin.price / 100).toFixed(2)}</span>`;

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([pin.lng, pin.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 20, closeButton: false, maxWidth: '220px' })
              .setHTML(
                `<div style="font-family:Inter,sans-serif;padding:6px 4px">
                   <div style="font-weight:700;font-size:14px;color:#111827;line-height:1.3">${pin.title}</div>
                   <div style="font-size:11px;color:#6b7280;margin-top:3px">${pin.category} · by ${pin.cook}</div>
                   <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
                     <div style="font-size:12px;color:#4b5563">${pin.qty} left</div>
                     <div style="font-size:13px">${priceLabel}</div>
                   </div>
                   <a href="/listings/${pin.id}" data-internal="true" style="
                     display:block;margin-top:8px;text-align:center;
                     background:#1a3a2a;color:white;font-size:12px;font-weight:600;
                     padding:5px 0;border-radius:6px;text-decoration:none;
                   ">View Listing →</a>
                 </div>`
              )
          )
          .addTo(map);

        el.addEventListener('click', () => { marker.togglePopup(); });
      });
    });

    return () => {
      container.removeEventListener('click', handleNavClick);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
