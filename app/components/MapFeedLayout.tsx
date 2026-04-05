'use client';

import { useRef, useState, useCallback } from 'react';
import MapboxMapClient from './MapboxMapClient';
import ListingFeed from './ListingFeed';

function useDraggable(initialBottom: number, initialRight: number) {
  const [pos, setPos] = useState({ bottom: initialBottom, right: initialRight });
  const didDrag = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startBottom = pos.bottom;
    const startRight = pos.right;
    didDrag.current = false;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag.current = true;
      setPos({
        bottom: Math.max(8, Math.min(window.innerHeight - 64, startBottom - dy)),
        right:  Math.max(8, Math.min(window.innerWidth  - 64, startRight  - dx)),
      });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   onUp);
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup',   onUp);
  }, [pos]);

  return { pos, onPointerDown, didDrag };
}

export default function MapFeedLayout() {
  const [mapWidth, setMapWidth]   = useState(55);
  const [mapVisible, setMapVisible] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { pos: mapBtnPos, onPointerDown: mapBtnDown, didDrag: mapBtnDragged } = useDraggable(72, 80);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const onMove = (ev: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct  = ((ev.clientX - rect.left) / rect.width) * 100;
      setMapWidth(Math.min(80, Math.max(20, pct)));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  }, []);

  // ─── shared button style factory ───────────────────────────
  const mapBtn = (extra?: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute',
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 10,
    border: '1.5px solid rgba(255,255,255,0.22)',
    background: 'rgba(15,30,20,0.82)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    color: 'white',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
    transition: 'background 0.15s, transform 0.12s',
    ...extra,
  });

  return (
    <div ref={containerRef} className="flex flex-1 overflow-hidden relative">

      {/* ════════════════════════════════════════════════════
          MAP PANEL — note: NO mixing of `relative` + `fixed`
          fullscreen → fixed inset-0   |  normal → block w-%
          ════════════════════════════════════════════════════ */}
      <div
        className={fullscreen ? 'fixed inset-0 z-50 overflow-hidden' : 'hidden md:block shrink-0 overflow-hidden'}
        style={fullscreen ? {} : {
          width: mapVisible ? `${mapWidth}%` : '0%',
          transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
          borderRight: mapVisible ? '1px solid #e5e7eb' : 'none',
        }}
      >
        <MapboxMapClient />

        {/* ── Expand button (normal view, bottom-left) ── */}
        {!fullscreen && (
          <button
            onClick={() => setFullscreen(true)}
            style={mapBtn({ bottom: 72, left: 16, top: 'auto' })}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(15,30,20,0.97)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(15,30,20,0.82)'; }}
          >
            {/* expand arrows icon */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
            Expand
          </button>
        )}

        {/* ── Hide button (normal view, top-right) ── */}
        {!fullscreen && (
          <button
            onClick={() => setMapVisible(false)}
            style={mapBtn({ top: 12, right: 12 })}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(15,30,20,0.97)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(15,30,20,0.82)'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
            </svg>
            Hide map
          </button>
        )}

        {/* ── EXIT fullscreen — large, centered, impossible to miss ── */}
        {fullscreen && (
          <button
            onClick={() => setFullscreen(false)}
            style={{
              position: 'absolute',
              bottom: 28,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 24px',
              borderRadius: 999,
              border: '2px solid rgba(255,255,255,0.35)',
              background: 'rgba(15,30,20,0.92)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: 'white',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(0,0,0,0.55)',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(26,58,42,0.97)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(15,30,20,0.92)'; }}
          >
            {/* compress/exit icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
            </svg>
            Exit fullscreen
          </button>
        )}
      </div>

      {/* ════════════════════════════════════════
          DRAG DIVIDER
          ════════════════════════════════════════ */}
      {mapVisible && !fullscreen && (
        <div
          onMouseDown={handleDragStart}
          className="hidden md:flex items-center justify-center shrink-0 cursor-col-resize group"
          style={{ width: 10, zIndex: 10, background: 'transparent', position: 'relative' }}
        >
          {/* pill */}
          <div style={{
            width: 4, height: 44, borderRadius: 99,
            background: '#cbd5e1',
            transition: 'background 0.15s, height 0.15s',
          }}
          className="group-hover:bg-green-400 group-hover:h-16"
          />
          {/* glow strip on hover */}
          <div
            style={{
              position: 'absolute', inset: '0 -2px',
              background: 'rgba(74,222,128,0.15)',
              borderRadius: 4,
              opacity: 0,
              transition: 'opacity 0.15s',
            }}
            className="group-hover:opacity-100"
          />
        </div>
      )}

      {/* ════════════════════════════════════════
          FEED
          ════════════════════════════════════════ */}
      <div className="flex-1 overflow-hidden relative" style={{ minWidth: 0 }}>

        {/* Show Map — appears when map is hidden, desktop only */}
        {!mapVisible && !fullscreen && (
          <button
            onClick={() => setMapVisible(true)}
            className="hidden md:flex"
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 10,
              alignItems: 'center',
              gap: 7,
              padding: '9px 16px',
              borderRadius: 999,
              border: 'none',
              background: '#1a3a2a',
              color: 'white',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 3px 14px rgba(0,0,0,0.22)',
              transition: 'transform 0.12s, box-shadow 0.12s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform  = 'scale(1.05)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 5px 20px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform  = 'scale(1)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 14px rgba(0,0,0,0.22)';
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
            </svg>
            Show map
          </button>
        )}

        {/* Mobile floating toggle */}
        <button
          onPointerDown={mapBtnDown}
          onClick={() => { if (!mapBtnDragged.current) setFullscreen(f => !f); }}
          className="flex md:hidden items-center gap-2 touch-none select-none"
          style={{
            position: 'fixed',
            bottom: mapBtnPos.bottom,
            right: mapBtnPos.right,
            zIndex: 40,
            padding: '10px 18px',
            borderRadius: 999,
            border: 'none',
            background: '#1a3a2a',
            color: 'white',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'grab',
            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
          </svg>
          {fullscreen ? 'Close' : 'Map'}
        </button>

        <ListingFeed />
      </div>
    </div>
  );
}
