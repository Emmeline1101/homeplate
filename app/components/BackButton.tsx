'use client';

import { useRouter } from 'next/navigation';

export default function BackButton({
  fallback = '/',
  variant = 'overlay',
}: {
  fallback?: string;
  variant?: 'overlay' | 'ghost';
}) {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }

  if (variant === 'ghost') {
    return (
      <button
        onClick={handleBack}
        aria-label="Go back"
        className="flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all active:scale-95"
      >
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleBack}
      aria-label="Go back"
      className="flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-95"
      style={{ backgroundColor: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(10px)' }}
    >
      <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
