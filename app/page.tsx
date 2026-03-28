import MapboxMapClient from './components/MapboxMapClient';
import Navbar from './components/Navbar';
import ListingFeed from './components/ListingFeed';

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#faf7f2' }}>
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Map — 55% */}
        <div className="hidden md:block relative border-r border-gray-200" style={{ width: '55%' }}>
          <MapboxMapClient />
        </div>

        {/* Feed — 45% */}
        <div className="w-full overflow-hidden" style={{ width: '45%' }}>
          <ListingFeed />
        </div>
      </div>
    </div>
  );
}
