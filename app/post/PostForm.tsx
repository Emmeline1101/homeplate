'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase';

// ── Permit Guide Accordion ───────────────────────────────────────────────────
function PermitGuide() {
  const [open, setOpen] = useState(false);

  const steps = [
    {
      num: '1',
      title: 'Check if you qualify',
      body: 'California Cottage Food Law (AB 1616) covers non-potentially-hazardous foods — baked goods, jams, candy, dried herbs, etc. Confirm your product is on the approved list before applying.',
    },
    {
      num: '2',
      title: 'Complete the food handler course',
      body: "Take a CDPH-approved food handler course (≈ $10–$15, about 2 hours online). You'll receive a certificate upon completion.",
    },
    {
      num: '3',
      title: 'Apply through your county health dept.',
      body: "Visit your county's Environmental Health website and submit a Cottage Food Operation (CFO) permit application. Fees vary by county ($50–$150). Processing typically takes 2–4 weeks.",
    },
    {
      num: '4',
      title: 'Receive your permit',
      body: "Your county will mail or email a signed permit document. Keep the original — you'll upload a photo or scan of it here.",
    },
    {
      num: '5',
      title: 'Upload your permit below',
      body: 'Take a clear photo or scan of your permit (JPEG/PNG/PDF). Make sure the permit number, your name, and the county seal are visible.',
    },
  ];

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span className="text-sm font-semibold text-blue-800">How to get a CA Cottage Food Permit</span>
        </div>
        <svg
          className={`w-4 h-4 text-blue-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-blue-200 pt-4">
          {steps.map((s) => (
            <div key={s.num} className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold shrink-0 mt-0.5">
                {s.num}
              </span>
              <div>
                <p className="text-sm font-semibold text-blue-900">{s.title}</p>
                <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-blue-600 mt-2 pt-2 border-t border-blue-200">
            Questions? Visit{' '}
            <span className="font-semibold">cdph.ca.gov</span> or contact your local county Environmental Health department.
          </p>
        </div>
      )}
    </div>
  );
}

const CATEGORIES = [
  'Baked Goods',
  'Asian Sweets',
  'Jams & Preserves',
  'Confections',
  'Dried & Packaged',
  'Fermented',
  'Noodles & Pantry',
  'Cookies & Biscuits',
];

const ALLERGENS = [
  { id: 'peanuts',    label: 'Peanuts' },
  { id: 'tree_nuts', label: 'Tree nuts' },
  { id: 'gluten',    label: 'Gluten' },
  { id: 'dairy',     label: 'Dairy' },
  { id: 'eggs',      label: 'Eggs' },
  { id: 'soy',       label: 'Soy' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'sesame',    label: 'Sesame' },
  { id: 'none',      label: 'None / allergen-free' },
];

// ── Shared input styles ──────────────────────────────────────────────────────
const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 ' +
  'focus:ring-orange-100 transition-colors';

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold text-slate-700 mb-2">{children}</p>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
      {children}
    </div>
  );
}

// ── Safety Disclaimer Modal ──────────────────────────────────────────────────
function SafetyModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-5">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 mx-auto">
          <svg
            className="w-6 h-6 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        {/* Copy */}
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold text-slate-900">Safety Confirmation</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            I confirm this food was prepared in a clean environment and all
            allergens are accurately disclosed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 active:bg-orange-700 transition-colors shadow-sm"
          >
            Confirm & Publish
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Form ────────────────────────────────────────────────────────────────
export default function PostForm() {
  const router = useRouter();
  const [isFree, setIsFree] = useState(false);
  const [allergens, setAllergens] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isVideoDragging, setIsVideoDragging] = useState(false);
  const [isPermitDragging, setIsPermitDragging] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [permitFile, setPermitFile] = useState<File | null>(null);
  const [permitError, setPermitError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [published, setPublished] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const permitInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function toggleAllergen(id: string) {
    setAllergens((prev) => {
      const next = new Set(prev);
      if (id === 'none') {
        if (next.has('none')) { next.delete('none'); }
        else { next.clear(); next.add('none'); }
      } else {
        next.delete('none');
        if (next.has(id)) next.delete(id); else next.add(id);
      }
      return next;
    });
  }

  const handlePhotoDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) setPhotoFile(file);
  }, []);

  const handleVideoDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsVideoDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) setVideoFile(file);
  }, []);

  const handlePermitDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPermitDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (allowed.includes(file.type)) {
        setPermitFile(file);
        setPermitError(false);
      }
    }
  }, []);

  function handlePublishClick() {
    if (!permitFile) {
      setPermitError(true);
      document.getElementById('permit-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setShowModal(true);
  }

  async function handleConfirm() {
    setShowModal(false);
    setUploading(true);
    setUploadProgress(0);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? 'anonymous';
    const listingId = crypto.randomUUID();

    if (permitFile) {
      const ext = permitFile.name.split('.').pop();
      await supabase.storage.from('permits')
        .upload(`${userId}/${listingId}.${ext}`, permitFile, { upsert: true });
    }
    setUploadProgress(20);

    let photoUrl: string | null = null;
    if (photoFile) {
      const ext = photoFile.name.split('.').pop();
      const path = `${userId}/${listingId}.${ext}`;
      await supabase.storage.from('listing-photos').upload(path, photoFile, { upsert: true });
      const { data } = supabase.storage.from('listing-photos').getPublicUrl(path);
      photoUrl = data.publicUrl;
    }
    setUploadProgress(50);

    let videoUrl: string | null = null;
    if (videoFile) {
      const ext = videoFile.name.split('.').pop();
      const path = `${userId}/${listingId}.${ext}`;
      await supabase.storage.from('listing-videos').upload(path, videoFile, {
        upsert: true,
        onUploadProgress: (p) => {
          const pct = 50 + Math.round((p.loaded / p.total) * 40);
          setUploadProgress(pct);
        },
      });
      const { data } = supabase.storage.from('listing-videos').getPublicUrl(path);
      videoUrl = data.publicUrl;
    }
    setUploadProgress(90);

    const fd = new FormData(formRef.current!);
    const priceRaw = fd.get('price') as string;
    await supabase.from('listings').insert({
      id: listingId,
      user_id: userId,
      title: fd.get('title') as string,
      description: (fd.get('description') as string) || null,
      cuisine_tag: fd.get('cuisine') as string,
      allergens: Array.from(allergens),
      quantity_total: parseInt(fd.get('portions') as string, 10),
      quantity_left: parseInt(fd.get('portions') as string, 10),
      price_cents: isFree ? 0 : Math.round(parseFloat(priceRaw || '0') * 100),
      pickup_start: fd.get('pickup_start') ? new Date(fd.get('pickup_start') as string).toISOString() : null,
      pickup_end: fd.get('pickup_end') ? new Date(fd.get('pickup_end') as string).toISOString() : null,
      photo_urls: photoUrl ? [photoUrl] : [],
      video_url: videoUrl,
      status: 'active' as const,
      made_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    });

    setUploadProgress(100);
    setUploading(false);
    setPublished(true);
    router.push(`/listings/${listingId}`);
  }

  return (
    <>
      <form
        ref={formRef}
        onSubmit={(e) => { e.preventDefault(); handlePublishClick(); }}
        className="space-y-5"
      >
        {/* ── Section 1: Basic info ── */}
        <SectionCard>
          <h2 className="text-base font-bold text-slate-900">Dish details</h2>

          {/* Title */}
          <div>
            <Label>Dish title</Label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Matcha Pound Cake, Yuzu Marmalade…"
              className={inputCls}
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <textarea
              name="description"
              rows={3}
              placeholder="Describe your cottage food — ingredients, flavor profile, shelf life, packaging…"
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Category */}
          <div>
            <Label>Category</Label>
            <select name="cuisine" required defaultValue="" className={inputCls}>
              <option value="" disabled>Select a category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </SectionCard>

        {/* ── Section 2: Allergens ── */}
        <SectionCard>
          <div>
            <Label>Allergens</Label>
            <p className="text-xs text-slate-500 -mt-1 mb-3">
              Required — select all that apply, or "None" if allergen-free.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALLERGENS.map(({ id, label }) => {
                const checked = allergens.has(id);
                return (
                  <label
                    key={id}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 cursor-pointer text-sm transition-colors
                      ${checked
                        ? 'border-orange-400 bg-orange-50 text-orange-700 font-medium'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleAllergen(id)}
                    />
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors
                        ${checked ? 'bg-orange-500 border-orange-500' : 'border-slate-300'}`}
                    >
                      {checked && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {label}
                  </label>
                );
              })}
            </div>
          </div>
        </SectionCard>

        {/* ── Section 3: Availability & Price ── */}
        <SectionCard>
          <h2 className="text-base font-bold text-slate-900">Availability & pricing</h2>

          {/* Portions */}
          <div>
            <Label>Portions available</Label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="portions"
                required
                min={1}
                max={20}
                defaultValue={2}
                className={`${inputCls} w-28`}
              />
              <span className="text-sm text-slate-500">portions (max 20)</span>
            </div>
          </div>

          {/* Price / Free toggle */}
          <div>
            <Label>Price</Label>
            <div className="flex items-center gap-3 mb-3">
              <button
                type="button"
                role="switch"
                aria-checked={isFree}
                onClick={() => setIsFree((v) => !v)}
                className={`relative inline-flex w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 shrink-0
                  ${isFree ? 'bg-green-500' : 'bg-slate-200'}`}
              >
                <span
                  className={`inline-block w-4 h-4 rounded-full bg-white shadow transition-transform mt-1
                    ${isFree ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
              <span className="text-sm text-slate-700">
                {isFree
                  ? <span className="font-semibold text-green-600">Free exchange</span>
                  : 'Free exchange?'}
              </span>
            </div>
            {!isFree && (
              <div className="relative w-36">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                <input
                  type="number"
                  name="price"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  className={`${inputCls} pl-7`}
                />
              </div>
            )}
          </div>

          {/* Pickup window */}
          <div>
            <Label>Pickup date & time window</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Start</p>
                <input type="datetime-local" name="pickup_start" required className={inputCls} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1.5">End</p>
                <input type="datetime-local" name="pickup_end" required className={inputCls} />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Section 4: Permit ── */}
        <div id="permit-section">
          <SectionCard>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Cottage Food Permit
                  <span className="ml-2 text-xs font-semibold text-red-500 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">Required</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  A valid CA Cottage Food Operation permit is required before publishing.
                </p>
              </div>
            </div>

            {/* Guide accordion */}
            <PermitGuide />

            {/* Permit upload */}
            <div>
              <Label>Upload your permit</Label>
              <div
                role="button" tabIndex={0}
                onDragOver={(e) => { e.preventDefault(); setIsPermitDragging(true); }}
                onDragLeave={() => setIsPermitDragging(false)}
                onDrop={handlePermitDrop}
                onClick={() => permitInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && permitInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
                  permitError
                    ? 'border-red-400 bg-red-50'
                    : isPermitDragging
                      ? 'border-blue-400 bg-blue-50'
                      : permitFile
                        ? 'border-green-400 bg-green-50'
                        : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
              >
                {permitFile ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">📄</div>
                    <p className="text-sm font-medium text-slate-700">{permitFile.name}</p>
                    <p className="text-xs text-slate-400">Click to replace</p>
                  </>
                ) : (
                  <>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${permitError ? 'bg-red-100' : 'bg-slate-200'}`}>
                      🪪
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-medium ${permitError ? 'text-red-600' : 'text-slate-700'}`}>
                        {permitError ? 'Permit required — drop a file or browse' : 'Drop your permit or browse'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">JPEG, PNG or PDF, up to 10 MB</p>
                    </div>
                  </>
                )}
              </div>
              {permitError && (
                <p className="mt-2 text-xs text-red-600 font-medium">
                  You must upload a valid Cottage Food Permit before publishing.
                </p>
              )}
              <input
                ref={permitInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="sr-only"
                onChange={e => {
                  const f = e.target.files?.[0] ?? null;
                  setPermitFile(f);
                  if (f) setPermitError(false);
                }}
              />
            </div>
          </SectionCard>
        </div>

        {/* ── Section 5: Photos & Video ── */}
        <SectionCard>
          <h2 className="text-base font-bold text-slate-900">Photos &amp; video</h2>


          {/* Photo upload */}
          <div>
            <Label>Photo <span className="text-slate-400 font-normal">(recommended)</span></Label>
            <div
              role="button" tabIndex={0}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handlePhotoDrop}
              onClick={() => photoInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && photoInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
                isDragging ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              {photoFile ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">✅</div>
                  <p className="text-sm font-medium text-slate-700">{photoFile.name}</p>
                  <p className="text-xs text-slate-400">Click to replace</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-2xl">📷</div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-700">
                      Drop a photo or <span className="text-amber-600 underline underline-offset-2">browse</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">JPEG or PNG, up to 10 MB</p>
                  </div>
                </>
              )}
            </div>
            <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
              onChange={e => setPhotoFile(e.target.files?.[0] ?? null)} />
          </div>

          {/* Video upload */}
          <div>
            <Label>Short video <span className="text-slate-400 font-normal">(optional — show your process)</span></Label>
            <div
              role="button" tabIndex={0}
              onDragOver={(e) => { e.preventDefault(); setIsVideoDragging(true); }}
              onDragLeave={() => setIsVideoDragging(false)}
              onDrop={handleVideoDrop}
              onClick={() => videoInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && videoInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
                isVideoDragging ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              {videoFile ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">🎬</div>
                  <p className="text-sm font-medium text-slate-700">{videoFile.name}</p>
                  <p className="text-xs text-slate-400">Click to replace</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-2xl">🎥</div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-700">
                      Drop a video or <span className="text-amber-600 underline underline-offset-2">browse</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">MP4 or MOV, up to 100 MB</p>
                  </div>
                </>
              )}
            </div>
            <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime,video/mov" className="sr-only"
              onChange={e => setVideoFile(e.target.files?.[0] ?? null)} />
          </div>
        </SectionCard>

        {/* ── Publish button ── */}
        {published ? (
          <div className="w-full rounded-2xl bg-green-50 border border-green-200 py-5 flex flex-col items-center gap-1">
            <span className="text-2xl">✅</span>
            <p className="text-sm font-bold text-green-700">Listing published!</p>
            <p className="text-xs text-green-600">Your cottage food is now visible to the community.</p>
          </div>
        ) : (
          <button
            type="submit" disabled={uploading}
            className="w-full rounded-2xl text-white font-bold text-base py-4 shadow-md transition-colors disabled:opacity-60"
            style={{ backgroundColor: '#1a3a2a' }}
          >
            {uploading ? `Uploading… ${uploadProgress}%` : 'Publish Listing'}
          </button>
          {uploading && (
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden -mt-2">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%`, backgroundColor: '#1a3a2a' }}
              />
            </div>
          )}
        )}
      </form>

      {showModal && (
        <SafetyModal
          onCancel={() => setShowModal(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
