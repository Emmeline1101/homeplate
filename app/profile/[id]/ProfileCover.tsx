'use client';

import { useState } from 'react';

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E")`;

interface Props {
  coverUrl?: string | null;
  coverFrom: string;
  coverTo: string;
  avatarUrl?: string | null;
  name?: string | null;
}

export default function ProfileCover({ coverUrl, coverFrom, coverTo, avatarUrl, name }: Props) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  return (
    <div
      className="relative w-full"
      style={{ height: 200 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 12;
        setOffset({ x, y });
      }}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
    >
      {/* Background layer — slightly oversized so parallax never shows edges */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ inset: '-12%' }}
      >
        <div
          className="w-full h-full"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            transition: 'transform 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: `linear-gradient(150deg, ${coverFrom} 0%, ${coverTo} 100%)` }}
            />
          )}
          {/* Noise texture */}
          <div
            className="absolute inset-0 mix-blend-overlay opacity-25"
            style={{ backgroundImage: NOISE, backgroundSize: '180px' }}
          />
          {/* Vignette */}
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, transparent 30%, rgba(0,0,0,0.18) 100%)' }}
          />
        </div>
      </div>

      {/* Avatar — pinned to bottom-left, half sticking out below cover */}
      <div
        className="absolute bottom-0 left-6 z-10"
        style={{ transform: 'translateY(50%)' }}
      >
        <div
          className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-3xl font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${coverFrom}, ${coverTo})` }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={name ?? ''} className="w-full h-full object-cover" />
          ) : (
            <span>{name?.[0] ?? '?'}</span>
          )}
        </div>
      </div>
    </div>
  );
}
