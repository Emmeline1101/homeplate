import Navbar from './components/Navbar';
import MapFeedLayout from './components/MapFeedLayout';

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#faf7f2' }}>
      <Navbar />
      <MapFeedLayout />
    </div>
  );
}
