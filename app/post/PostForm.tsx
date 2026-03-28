'use client';

import { useState, useRef, useCallback } from 'react';

const CUISINES = [
  'Chinese', 'Japanese', 'Korean', 'Mexican',
  'Italian', 'Indian', 'American', 'Vietnamese', 'Thai', 'Other',
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
  const [isFree, setIsFree] = useState(false);
  const [allergens, setAllergens] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function toggleAllergen(id: string) {
    setAllergens((prev) => {
      const next = new Set(prev);
      if (id === 'none') {
        // selecting "none" clears others; toggling off clears none
        if (next.has('none')) {
          next.delete('none');
        } else {
          next.clear();
          next.add('none');
        }
      } else {
        next.delete('none'); // uncheck "none" when a real allergen is picked
        if (next.has(id)) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setPhotoName(file.name);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhotoName(file.name);
  }

  function handlePublishClick() {
    setShowModal(true);
  }

  function handleConfirm() {
    setShowModal(false);
    // Real submission will go here
    alert('Listing published! (mock)');
  }

  return (
    <>
      <form
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
              placeholder="e.g. Grandma's Kung Pao Chicken"
              className={inputCls}
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <textarea
              name="description"
              rows={3}
              placeholder="Tell people about your dish — ingredients, story, serving suggestions…"
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Cuisine */}
          <div>
            <Label>Cuisine tag</Label>
            <select name="cuisine" required defaultValue="" className={inputCls}>
              <option value="" disabled>Select a cuisine…</option>
              {CUISINES.map((c) => (
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

        {/* ── Section 4: Photo ── */}
        <SectionCard>
          <div>
            <Label>Photo</Label>
            <div
              role="button"
              tabIndex={0}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-colors
                ${isDragging
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-orange-50/50'
                }`}
            >
              {photoName ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                    ✅
                  </div>
                  <p className="text-sm font-medium text-slate-700">{photoName}</p>
                  <p className="text-xs text-slate-400">Click to replace</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-2xl">
                    📷
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-700">
                      Drop a photo here or <span className="text-orange-500 underline underline-offset-2">browse</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">JPEG or PNG, up to 10 MB</p>
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="sr-only"
              onChange={handleFileChange}
            />
          </div>
        </SectionCard>

        {/* ── Publish button ── */}
        <button
          type="submit"
          className="w-full rounded-2xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-base py-4 shadow-md shadow-orange-200 transition-colors"
        >
          Publish Listing
        </button>
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
