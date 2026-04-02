import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import { createClient } from '../lib/supabaseServer';

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  category: 'health_nutrition' | 'food_tutorial' | 'ingredient_intro' | 'food_story';
  view_count: number;
  like_count: number;
  created_at: string;
  author: { id: string; name: string; avatar_url: string | null };
};

const CATEGORIES = {
  health_nutrition: { label: 'Health & Nutrition', en: 'Health & Nutrition', color: 'bg-green-100 text-green-700', emoji: '🥗' },
  food_tutorial:    { label: 'Food Tutorials',      en: 'Food Tutorials',      color: 'bg-amber-100 text-amber-700',  emoji: '👨‍🍳' },
  ingredient_intro: { label: 'Ingredients',          en: 'Ingredients',          color: 'bg-orange-100 text-orange-700', emoji: '🌾' },
  food_story:       { label: 'Food Stories',          en: 'Food Stories',          color: 'bg-rose-100 text-rose-700',   emoji: '❤️' },
} as const;

function readTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  let query = (supabase as any)
    .from('blog_posts')
    .select('id, slug, title, excerpt, cover_image_url, category, view_count, like_count, created_at, content, users!blog_posts_user_id_fkey(id, name, avatar_url)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (category && category in CATEGORIES) {
    query = query.eq('category', category);
  }

  const { data } = await query;

  const posts: BlogPost[] = ((data as any[]) ?? []).map((r: any) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? '',
    cover_image_url: r.cover_image_url,
    category: r.category,
    view_count: r.view_count,
    like_count: r.like_count,
    created_at: r.created_at,
    _readTime: readTime(r.content ?? ''),
    author: {
      id: r.users?.id ?? '',
      name: r.users?.name ?? 'Anonymous',
      avatar_url: r.users?.avatar_url ?? null,
    },
  })) as any[];

  const featured = posts[0] ?? null;
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf7f2' }}>
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight" style={{ color: '#1a3a2a' }}>
              Food Stories
              <span className="block text-lg font-normal text-gray-400 mt-1 tracking-widest uppercase">
                From Your Neighbors
              </span>
            </h1>
            <p className="mt-3 text-gray-500 text-sm max-w-md">
              Recipes, nutrition tips, and food stories shared by home cooks in your community.
            </p>
          </div>
          <Link
            href="/blog/write"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 shrink-0"
            style={{ backgroundColor: '#1a3a2a' }}
          >
            ✏️ Write a Post
          </Link>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {([['', 'All', '📚']] as [string, string, string][]).concat(
            Object.entries(CATEGORIES).map(([k, v]) => [k, v.label, v.emoji])
          ).map(([key, label, emoji]) => {
            const active = (category ?? '') === key;
            return (
              <Link
                key={key}
                href={key ? `/blog?category=${key}` : '/blog'}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  active
                    ? 'text-white border-transparent'
                    : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
                }`}
                style={active ? { backgroundColor: '#1a3a2a' } : {}}
              >
                {emoji} {label}
              </Link>
            );
          })}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-lg font-medium">No posts yet</p>
            <p className="text-sm mt-1">Be the first to share a food story!</p>
            <Link
              href="/blog/write"
              className="inline-block mt-6 px-6 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: '#1a3a2a' }}
            >
              Write a Post
            </Link>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="group block mb-10">
                <div className="rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  {featured.cover_image_url ? (
                    <div className="relative w-full h-64 md:h-80">
                      <Image
                        src={featured.cover_image_url}
                        alt={featured.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-40 md:h-56 flex items-center justify-center text-6xl"
                      style={{ backgroundColor: '#faf7f2' }}>
                      {CATEGORIES[featured.category].emoji}
                    </div>
                  )}
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORIES[featured.category].color}`}>
                        {CATEGORIES[featured.category].emoji} {CATEGORIES[featured.category].label}
                      </span>
                      <span className="text-xs text-gray-400">Featured</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {featured.title}
                    </h2>
                    <p className="mt-2 text-gray-500 text-sm line-clamp-2">{featured.excerpt}</p>
                    <div className="flex items-center gap-3 mt-5">
                      {featured.author.avatar_url ? (
                        <Image src={featured.author.avatar_url} alt={featured.author.name} width={32} height={32} className="rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: '#1a3a2a' }}>
                          {featured.author.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700">{featured.author.name}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{formatDate(featured.created_at)}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">👁 {featured.view_count}</span>
                      <span className="text-xs text-gray-400">❤️ {featured.like_count}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Post grid */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                    <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col">
                      {post.cover_image_url ? (
                        <div className="relative w-full h-44">
                          <Image
                            src={post.cover_image_url}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center text-5xl" style={{ backgroundColor: '#faf7f2' }}>
                          {CATEGORIES[post.category].emoji}
                        </div>
                      )}
                      <div className="p-4 flex flex-col flex-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit mb-2 ${CATEGORIES[post.category].color}`}>
                          {CATEGORIES[post.category].emoji} {CATEGORIES[post.category].label}
                        </span>
                        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 flex-1">{post.excerpt}</p>
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                          {post.author.avatar_url ? (
                            <Image src={post.author.avatar_url} alt={post.author.name} width={24} height={24} className="rounded-full" />
                          ) : (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: '#1a3a2a' }}>
                              {post.author.name[0]?.toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs text-gray-600 font-medium truncate">{post.author.name}</span>
                          <span className="ml-auto text-xs text-gray-400">❤️ {post.like_count}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
