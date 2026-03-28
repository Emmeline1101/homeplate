'use client';

import { useEffect, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<mapboxgl.Map | null>(null);

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

    map.on('load', () => {
      PINS.forEach((pin) => {
        const el = document.createElement('div');
        el.style.cssText = `
          width:36px; height:36px; border-radius:50%;
          background-color:#1a3a2a; border:2.5px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.45);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:transform 0.15s;
        `;
        el.innerHTML = FORK_SVG;
        el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.2)'; });
        el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)'; });

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

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
