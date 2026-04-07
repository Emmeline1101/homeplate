'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '../../actions/profile';

type MessagePrivacy = 'everyone' | 'followers' | 'following' | 'friends';

const PRIVACY_OPTIONS: { value: MessagePrivacy; label: string; desc: string }[] = [
  { value: 'everyone',  label: 'Everyone',          desc: 'Anyone can send you a message' },
  { value: 'followers', label: 'My followers only',  desc: 'People who follow you' },
  { value: 'following', label: 'People I follow',    desc: 'People you follow' },
  { value: 'friends',   label: 'Friends only',       desc: 'Mutual followers' },
];

interface Props {
  profile: {
    name: string | null;
    bio: string | null;
    city: string | null;
    state: string | null;
    avatar_url: string | null;
    cover_url: string | null;
    message_privacy: MessagePrivacy;
  };
  coverFrom: string;
  coverTo: string;
}

export default function EditProfileModal({ profile, coverFrom, coverTo }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [coverPreview, setCoverPreview] = useState<string | null>(profile.cover_url);
  const [privacy, setPrivacy] = useState<MessagePrivacy>(profile.message_privacy);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setCoverPreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(data);
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
      >
        Edit Profile
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-base font-extrabold" style={{ color: '#1a3a2a' }}>Edit Profile</h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="px-5 pb-6 space-y-5">
              {/* Cover image picker */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Cover Photo</label>
                <label className="relative block w-full h-28 rounded-2xl overflow-hidden cursor-pointer group">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ background: `linear-gradient(150deg, ${coverFrom} 0%, ${coverTo} 100%)` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Change cover
                    </span>
                  </div>
                  <input
                    type="file"
                    name="cover"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleCoverChange}
                  />
                </label>
              </div>

              {/* Avatar picker */}
              <div className="flex items-center gap-4">
                <label className="relative cursor-pointer group shrink-0">
                  <div
                    className="w-16 h-16 rounded-2xl border-2 border-white shadow-md overflow-hidden flex items-center justify-center text-2xl font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${coverFrom}, ${coverTo})` }}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      profile.name?.[0] ?? '?'
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    type="file"
                    name="avatar"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleAvatarChange}
                  />
                </label>
                <div className="text-xs text-gray-400 leading-relaxed">
                  <p className="font-semibold text-gray-600">Profile Photo</p>
                  <p>Tap to change your avatar</p>
                </div>
              </div>

              {/* Text fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={profile.name ?? ''}
                    maxLength={60}
                    placeholder="Your name"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]/20 focus:border-[#1a3a2a] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    defaultValue={profile.bio ?? ''}
                    rows={3}
                    maxLength={200}
                    placeholder="Tell others about your cooking style…"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]/20 focus:border-[#1a3a2a] transition-colors resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      defaultValue={profile.city ?? ''}
                      maxLength={60}
                      placeholder="San Francisco"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]/20 focus:border-[#1a3a2a] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      defaultValue={profile.state ?? ''}
                      maxLength={30}
                      placeholder="CA"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]/20 focus:border-[#1a3a2a] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Message Privacy */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  💬 Who can message you?
                </label>
                <input type="hidden" name="message_privacy" value={privacy} />
                <div className="grid grid-cols-2 gap-2">
                  {PRIVACY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPrivacy(opt.value)}
                      className="text-left px-3 py-2.5 rounded-xl border transition-all"
                      style={privacy === opt.value
                        ? { borderColor: '#1a3a2a', backgroundColor: '#f0f7f4' }
                        : { borderColor: '#e5e7eb', backgroundColor: '#fff' }
                      }
                    >
                      <p className="text-xs font-bold" style={{ color: privacy === opt.value ? '#1a3a2a' : '#374151' }}>
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-opacity disabled:opacity-60"
                style={{ backgroundColor: '#1a3a2a' }}
              >
                {isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
