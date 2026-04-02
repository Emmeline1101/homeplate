import Link from 'next/link';
import Navbar from '../components/Navbar';
import DiscoverFeed from './DiscoverFeed';

export const metadata = { title: 'Discover · HomePlate' };

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string; tag?: string; sort?: string }>;
}) {
  const { focus, tag, sort } = await searchParams;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f7f4ef' }}>
      <Navbar />

      <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-6 pb-20 md:pb-8 space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400">Community</p>
            <h1 className="text-2xl font-extrabold tracking-tight mt-0.5" style={{ color: '#1a3a2a' }}>
              Discover
            </h1>
          </div>
          <Link
            href="/discover/new"
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#1a3a2a' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Share
          </Link>
        </div>

        <DiscoverFeed focusId={focus} activeTag={tag} sort={sort} />
      </main>
    </div>
  );
}
