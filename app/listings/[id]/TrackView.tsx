'use client';

import { useEffect } from 'react';

export default function TrackView({ listingId }: { listingId: string }) {
  useEffect(() => {
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: listingId, source: 'detail' }),
    }).catch(() => {});
  }, [listingId]);

  return null;
}
