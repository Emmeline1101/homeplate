'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MOCK_LISTINGS = [
  { id: '1', lat: 37.7749, lng: -122.4194, title: 'Kung Pao Chicken',      cuisine: 'Chinese'  },
  { id: '2', lat: 34.0522, lng: -118.2437, title: 'Street Tacos al Pastor', cuisine: 'Mexican'  },
  { id: '3', lat: 40.7128, lng: -74.006,   title: 'Homemade Lasagna',       cuisine: 'Italian'  },
  { id: '4', lat: 47.6062, lng: -122.3321, title: 'Tonkotsu Ramen',         cuisine: 'Japanese' },
  { id: '5', lat: 41.8781, lng: -87.6298,  title: 'Butter Chicken',         cuisine: 'Indian'   },
  { id: '6', lat: 29.7604, lng: -95.3698,  title: 'BBQ Brisket',            cuisine: 'American' },
];

const CUISINE_COLORS: Record<string, string> = {
  Chinese:  '#ef4444',
  Mexican:  '#f97316',
  Italian:  '#22c55e',
  Japanese: '#3b82f6',
  Indian:   '#a855f7',
  American: '#eab308',
};

// This component is only rendered when NEXT_PUBLIC_MAPBOX_TOKEN starts with "pk."
export default function MapboxMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5795, 39.8283],
      zoom: 3.5,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      MOCK_LISTINGS.forEach((listing) => {
        const el = document.createElement('div');
        el.className = 'flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold shadow-lg cursor-pointer border-2 border-white';
        el.style.backgroundColor = CUISINE_COLORS[listing.cuisine] ?? '#6366f1';
        el.textContent = listing.cuisine[0];

        new mapboxgl.Marker({ element: el })
          .setLngLat([listing.lng, listing.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 16, closeButton: false }).setHTML(
              `<div class="text-sm font-medium">${listing.title}</div>
               <div class="text-xs text-gray-500">${listing.cuisine}</div>`
            )
          )
          .addTo(map);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
