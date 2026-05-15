'use client';

import { useState } from 'react';
import { clearHistory } from '../actions/history';

export default function ClearHistoryButton() {
  const [pending, setPending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleClear() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    setPending(true);
    await clearHistory();
    setPending(false);
    setConfirmed(false);
  }

  if (confirmed) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">确认清除所有记录？</span>
        <button
          onClick={handleClear}
          disabled={pending}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {pending ? '清除中…' : '确认'}
        </button>
        <button
          onClick={() => setConfirmed(false)}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleClear}
      className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
    >
      清除记录
    </button>
  );
}
