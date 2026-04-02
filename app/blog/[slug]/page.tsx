'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import { createClient } from '../../lib/supabase';

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  category: 'health_nutrition' | 'food_tutorial' | 'ingredient_intro' | 'food_story';
  view_count: number;
  like_count: number;
  tags: string[];
  created_at: string;
  user_id: string;
  author: { id: string; name: string; avatar_url: string | null; bio: string | null };
};

type RelatedPost = {
  id: string;
  slug: string;
  title: string;
  cover_image_url: string | null;
  category: string;
  created_at: string;
};

const CATEGORIES = {
  health_nutrition: { label: 'Health & Nutrition', en: 'Health & Nutrition', color: 'bg-green-100 text-green-700', emoji: '🥗' },
  food_tutorial:    { label: 'Food Tutorials',      en: 'Food Tutorials',      color: 'bg-amber-100 text-amber-700',  emoji: '👨‍🍳' },
  ingredient_intro: { label: 'Ingredients',          en: 'Ingredients',          color: 'bg-orange-100 text-orange-700', emoji: '🌾' },
  food_story:       { label: 'Food Stories',          en: 'Food Stories',          color: 'bg-rose-100 text-rose-700',   emoji: '❤️' },
} as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function readTime(content: string) {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<RelatedPost[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const { data, error } = await (supabase as any)
        .from('blog_posts')
        .select('*, users!blog_posts_user_id_fkey(id, name, avatar_url, bio)')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const p: BlogPost = {
        ...data,
        author: {
          id: data.users?.id,
          name: data.users?.name ?? 'Anonymous',
          avatar_url: data.users?.avatar_url ?? null,
          bio: data.users?.bio ?? null,
        },
      };
      setPost(p);
      setLikeCount(data.like_count ?? 0);

      // Check if current user liked this post
      if (user) {
        const { data: likeRow } = await (supabase as any)
          .from('blog_likes')
          .select('post_id')
          .eq('post_id', data.id)
          .eq('user_id', user.id)
          .maybeSingle();
        setLiked(!!likeRow);
      }

      // Increment view count (fire and forget)
      (supabase as any)
        .from('blog_posts')
        .update({ view_count: (data.view_count ?? 0) + 1 })
        .eq('id', data.id)
        .then(() => {});

      // Fetch related posts from same author
      const { data: relatedData } = await (supabase as any)
        .from('blog_posts')
        .select('id, slug, title, cover_image_url, category, created_at')
        .eq('user_id', data.user_id)
        .eq('status', 'published')
        .neq('id', data.id)
        .order('created_at', { ascending: false })
        .limit(3);

      setRelated((relatedData as RelatedPost[]) ?? []);
      setLoading(false);
    }
    load();
  }, [slug]);

  async function toggleLike() {
    if (!currentUserId || !post) {
      router.push('/auth/signin');
      return;
    }
    if (liked) {
      await (supabase as any)
        .from('blog_likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', currentUserId);
      setLiked(false);
      setLikeCount(c => Math.max(0, c - 1));
    } else {
      await (supabase as any)
        .from('blog_likes')
        .insert({ post_id: post.id, user_id: currentUserId });
      setLiked(true);
      setLikeCount(c => c + 1);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#faf7f2' }}>
        <Navbar />
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-amber-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#faf7f2' }}>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center text-gray-400">
          <div className="text-5xl mb-4">🍃</div>
          <p className="text-lg font-medium text-gray-700">Post not found</p>
          <p className="text-sm mt-1">This post may have been deleted or the link is incorrect.</p>
          <Link href="/blog" className="inline-block mt-6 px-5 py-2 rounded-full text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: '#1a3a2a' }}>
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const cat = CATEGORIES[post.category];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf7f2' }}>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        {/* Cover image */}
        {post.cover_image_url && (
          <div className="relative w-full h-72 md:h-96 rounded-3xl overflow-hidden mb-8">
            <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" />
          </div>
        )}

        {/* Category + title */}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.color}`}>
          {cat.emoji} {cat.label}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 leading-tight">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-gray-500 mt-3 text-base leading-relaxed">{post.excerpt}</p>
        )}

        {/* Author + meta row */}
        <div className="flex items-center gap-3 mt-5 pb-6 border-b border-gray-200">
          {post.author.avatar_url ? (
            <Image src={post.author.avatar_url} alt={post.author.name} width={40} height={40} className="rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: '#1a3a2a' }}>
              {post.author.name[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-800">{post.author.name}</p>
            <p className="text-xs text-gray-400">
              {formatDate(post.created_at)} · {readTime(post.content)} min read
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
            <span>👁 {post.view_count}</span>
          </div>
        </div>

        {/* Content */}
        <article className="prose-custom mt-8 text-gray-700 leading-8 whitespace-pre-wrap text-base">
          {post.content}
        </article>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
            {post.tags.map(tag => (
              <a key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs hover:bg-emerald-100 hover:text-emerald-700 transition-colors">
                #{tag}
              </a>
            ))}
          </div>
        )}

        {/* Like button */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
              liked
                ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {liked ? '❤️' : '🤍'} {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
          </button>
          <span className="text-xs text-gray-400">Thanks for reading — share it with a friend!</span>
        </div>

        {/* Author bio card */}
        <div className="mt-12 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-medium">About the Author</p>
          <div className="flex items-start gap-4">
            {post.author.avatar_url ? (
              <Image src={post.author.avatar_url} alt={post.author.name} width={52} height={52} className="rounded-full shrink-0" />
            ) : (
              <div className="w-13 h-13 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0" style={{ backgroundColor: '#1a3a2a', width: 52, height: 52 }}>
                {post.author.name[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900">{post.author.name}</p>
              {post.author.bio && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{post.author.bio}</p>}
              <Link
                href={`/profile/${post.author.id}`}
                className="inline-block mt-3 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                View Profile →
              </Link>
            </div>
          </div>
        </div>

        {/* More from this author */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              More from {post.author.name}
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map(r => {
                const rCat = CATEGORIES[r.category as keyof typeof CATEGORIES];
                return (
                  <Link key={r.id} href={`/blog/${r.slug}`} className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-shadow">
                    {r.cover_image_url ? (
                      <div className="relative w-full h-28">
                        <Image src={r.cover_image_url} alt={r.title} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-20 flex items-center justify-center text-4xl" style={{ backgroundColor: '#faf7f2' }}>
                        {rCat?.emoji}
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-xs font-semibold line-clamp-2 text-gray-700 group-hover:text-amber-600 transition-colors">
                        {r.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(r.created_at)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
