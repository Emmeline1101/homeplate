import MapboxMapClient from './components/MapboxMapClient';
import Navbar from './components/Navbar';
import ListingFeed from './components/ListingFeed';

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#faf7f2' }}>
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Map — desktop only, 55% */}
        <div className="hidden md:block relative border-r border-gray-200 shrink-0" style={{ width: '55%' }}>
          <MapboxMapClient />
        </div>

        {/* Feed — full width on mobile, 45% on desktop */}
        <div className="flex-1 overflow-hidden" style={{ minWidth: 0 }}>
          <ListingFeed />
        </div>
      </div>
    </div>
  );
}
