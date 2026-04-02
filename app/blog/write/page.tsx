'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { createClient } from '../../lib/supabase';

type Category = 'health_nutrition' | 'food_tutorial' | 'ingredient_intro' | 'food_story';

const CATEGORIES: { value: Category; emoji: string; label: string }[] = [
  { value: 'food_story',       emoji: '❤️', label: 'Food Stories' },
  { value: 'food_tutorial',    emoji: '👨‍🍳', label: 'Food Tutorials' },
  { value: 'health_nutrition', emoji: '🥗', label: 'Health & Nutrition' },
  { value: 'ingredient_intro', emoji: '🌾', label: 'Ingredients' },
];

function generateSlug(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
    .replace(/^-+|-+$/g, '');
  const suffix = id.slice(0, 6);
  return base ? `${base}-${suffix}` : suffix;
}

export default function WriteBlogPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('food_story');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [tags, setTags] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/auth/signin');
      } else {
        setUserId(data.user.id);
      }
      setAuthLoading(false);
    });
  }, []);

  async function handleSubmit(status: 'draft' | 'published') {
    if (!userId) { router.push('/auth/signin'); return; }
    if (!title.trim()) { setError('Please enter a title.'); return; }
    if (!content.trim()) { setError('Please write some content.'); return; }
    setError('');
    setSaving(true);

    const id = crypto.randomUUID();
    const slug = generateSlug(title, id);
    const tagsArr = tags.split(',').map(t => t.trim()).filter(Boolean);

    const { error: err } = await (supabase as any)
      .from('blog_posts')
      .insert({
        id,
        user_id: userId,
        title: title.trim(),
        slug,
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        cover_image_url: coverUrl.trim() || null,
        category,
        tags: tagsArr,
        status,
      });

    setSaving(false);

    if (err) {
      setError(err.message);
      return;
    }

    if (status === 'published') {
      router.push(`/blog/${slug}`);
    } else {
      router.push('/blog');
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#faf7f2' }}>
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-amber-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf7f2' }}>
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/blog" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <span className="text-gray-300">·</span>
          <h1 className="text-xl font-bold" style={{ color: '#1a3a2a' }}>Write a Post</h1>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
          {/* Cover image URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Cover Image URL <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={e => setCoverUrl(e.target.value)}
              placeholder="https://example.com/cover.jpg"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-gray-50 placeholder:text-gray-300"
            />
            {coverUrl && (
              <div className="mt-2 rounded-xl overflow-hidden h-36 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverUrl} alt="preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give your post a great title…"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-gray-50 placeholder:text-gray-300 font-medium"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    category === cat.value
                      ? 'border-transparent text-white'
                      : 'border-gray-200 text-gray-600 bg-gray-50 hover:border-gray-300'
                  }`}
                  style={category === cat.value ? { backgroundColor: '#1a3a2a' } : {}}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Summary <span className="font-normal text-gray-400">(optional, max 200 characters)</span>
            </label>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value.slice(0, 200))}
              rows={2}
              placeholder="A short intro for your post…"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-gray-50 placeholder:text-gray-300 resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{excerpt.length}/200</p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Content <span className="text-red-400">*</span>
              <span className="font-normal text-gray-400 ml-1">(Markdown supported)</span>
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={14}
              placeholder={"Share your food story, cooking tips, or nutrition knowledge…\n\nMarkdown is supported, e.g.:\n**bold** _italic_\n# Heading\n- List item"}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-gray-50 placeholder:text-gray-300 resize-y leading-7 font-mono"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tags <span className="font-normal text-gray-400">(comma-separated, e.g. matcha, low-sugar, snacks)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="matcha, low-sugar, snacks"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-gray-50 placeholder:text-gray-300"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handleSubmit('published')}
              disabled={saving}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#1a3a2a' }}
            >
              {saving ? 'Publishing…' : '🚀 Publish'}
            </button>
            <button
              onClick={() => handleSubmit('draft')}
              disabled={saving}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
