'use client';

import { useState, useTransition } from 'react';
import { updateEmail, updatePassword } from '../../actions/account';

type Tab = 'email' | 'password';

interface Props {
  currentEmail: string;
}

export default function AccountSettingsModal({ currentEmail }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('email');

  // Email form state
  const [emailPending, startEmailTransition] = useTransition();
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Password form state
  const [passwordPending, startPasswordTransition] = useTransition();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);
    const data = new FormData(e.currentTarget);
    startEmailTransition(async () => {
      const result = await updateEmail(data);
      if (result.error) {
        setEmailError(result.error);
      } else {
        setEmailSuccess(result.message ?? 'Done!');
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    const data = new FormData(e.currentTarget);
    startPasswordTransition(async () => {
      const result = await updatePassword(data);
      if (result.error) {
        setPasswordError(result.error);
      } else {
        setPasswordSuccess(result.message ?? 'Done!');
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  function handleClose() {
    setOpen(false);
    setEmailError(null);
    setEmailSuccess(null);
    setPasswordError(null);
    setPasswordSuccess(null);
    setTab('email');
    setShowPasswords(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Settings
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-base font-extrabold" style={{ color: '#1a3a2a' }}>Account Settings</h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex mx-5 mb-4 p-1 bg-gray-100 rounded-2xl gap-1">
              {(['email', 'password'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setEmailError(null);
                    setEmailSuccess(null);
                    setPasswordError(null);
                    setPasswordSuccess(null);
                  }}
                  className="flex-1 py-2 text-xs font-bold rounded-xl transition-all"
                  style={tab === t
                    ? { backgroundColor: '#fff', color: '#1a3a2a', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                    : { color: '#6b7280' }
                  }
                >
                  {t === 'email' ? 'Change Email' : 'Change Password'}
                </button>
              ))}
            </div>

            {/* Email tab */}
            {tab === 'email' && (
              <form onSubmit={handleEmailSubmit} className="px-5 pb-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Current Email</label>
                  <div className="text-sm px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-500">
                    {currentEmail}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">New Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="new@example.com"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]/20 focus:border-[#1a3a2a] transition-colors"
                  />
                </div>

                {emailError && (
                  <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">{emailError}</p>
                )}
                {emailSuccess && (
                  <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-xl">{emailSuccess}</p>
                )}

                <button
                  type="submit"
                  disabled={emailPending}
                  className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: '#1a3a2a' }}
                >
                  {emailPending ? 'Sending…' : 'Send Confirmation Email'}
                </button>
              </form>
            )}

            {/* Password tab */}
            {tab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="px-5 pb-6 space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Current Password</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      name="current_password"
                      required
                      autoComplete="current-password"
                      placeholder="Enter current password"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]/20 focus:border-[#1a3a2a] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">New Password</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      name="new_password"
                      required
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]/20 focus:border-[#1a3a2a] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Confirm New Password</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      name="confirm_password"
                      required
                      autoComplete="new-password"
                      placeholder="Repeat new password"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]/20 focus:border-[#1a3a2a] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPasswords(v => !v)}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {showPasswords
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                    }
                  </svg>
                  {showPasswords ? 'Hide passwords' : 'Show passwords'}
                </button>

                {passwordError && (
                  <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-xl">{passwordSuccess}</p>
                )}

                <button
                  type="submit"
                  disabled={passwordPending}
                  className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: '#1a3a2a' }}
                >
                  {passwordPending ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
