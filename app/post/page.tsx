import Navbar from '../components/Navbar';
import PostForm from './PostForm';

export const metadata = {
  title: 'Share a Bite — HomeBites',
};

export default function PostPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Share a bite</h1>
          <p className="text-sm text-slate-500 mt-1">
            List your cottage food — baked goods, jams, confections, and more. A valid CA Cottage Food Permit is required.
          </p>
        </div>

        <PostForm />
      </main>
    </div>
  );
}
