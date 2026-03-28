import MapboxMapClient from './components/MapboxMapClient';
import Navbar from './components/Navbar';
import ListingFeed from './components/ListingFeed';

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Map */}
        <div className="hidden md:block w-1/2 relative border-r border-slate-100">
          <MapboxMapClient />
        </div>

        {/* Right: Feed */}
        <div className="w-full md:w-1/2 overflow-hidden">
          <ListingFeed />
        </div>
      </div>
    </div>
  );
}
