'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { createClient } from '../../lib/supabase';

const MAX_PHOTOS = 9;
const MAX_CAPTION = 300;

export default function NewMomentPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [caption, setCaption] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const accepted = Array.from(incoming).filter(f => f.type.startsWith('image/')).slice(0, MAX_PHOTOS - files.length);
    if (accepted.length === 0) return;
    setFiles(prev => [...prev, ...accepted]);
    accepted.forEach(f => {
      const url = URL.createObjectURL(f);
      setPreviews(prev => [...prev, url]);
    });
  }, [files.length]);

  const removePhoto = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[i]);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const addTag = () => {
    const raw = tagInput.trim().replace(/^#+/, '');
    if (!raw || tags.length >= 10 || tags.includes(`#${raw}`)) {
      setTagInput('');
      return;
    }
    setTags(prev => [...prev, `#${raw}`]);
    setTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0 && !caption.trim()) {
      setError('Add at least a photo or caption.');
      return;
    }
    setSubmitting(true);
    setError('');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    // Upload photos
    const photoUrls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `moments/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('moments').upload(path, file, { upsert: false });
      if (upErr) { setError(`Upload failed: ${upErr.message}`); setSubmitting(false); return; }
      const { data: { publicUrl } } = supabase.storage.from('moments').getPublicUrl(path);
      photoUrls.push(publicUrl);
    }

    // Fetch user lat/lng
    const { data: profile } = await supabase
      .from('users')
      .select('lat, lng')
      .eq('id', user.id)
      .single();

    const { error: insertErr } = await supabase.from('moments').insert({
      user_id: user.id,
      caption: caption.trim() || null,
      photo_urls: photoUrls,
      tags,
      lat: profile?.lat ?? null,
      lng: profile?.lng ?? null,
    });

    if (insertErr) { setError(insertErr.message); setSubmitting(false); return; }

    router.push('/discover');
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f7f4ef' }}>
      <Navbar />

      <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-6 pb-20 md:pb-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-black/5 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#1a3a2a' }}>Share a Moment</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Photo grid */}
          <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Photos · {files.length}/{MAX_PHOTOS}</p>
            <div className="grid grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
              {files.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-gray-400 transition-colors bg-gray-50"
                >
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px] text-gray-400 font-medium">Add</span>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => addFiles(e.target.files)}
            />
          </div>

          {/* Caption */}
          <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Caption</p>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value.slice(0, MAX_CAPTION))}
              placeholder="What's cooking? Share your story…"
              rows={3}
              className="w-full text-sm text-gray-800 placeholder-gray-400 bg-transparent resize-none focus:outline-none leading-relaxed"
            />
            <p className="text-right text-xs text-gray-400 mt-1">{caption.length}/{MAX_CAPTION}</p>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tags</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                    className="text-emerald-500 hover:text-emerald-800 leading-none"
                  >×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                placeholder="#homecook"
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-400 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={addTag}
                className="text-sm font-semibold px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#1a3a2a' }}
          >
            {submitting ? 'Posting…' : 'Post Moment'}
          </button>
        </form>
      </main>
    </div>
  );
}
