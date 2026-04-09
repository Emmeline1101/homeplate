'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

export type ChatPageContext = {
  title: string;
  cuisine_tag: string | null;
  emoji: string | null;
};

type ChatContextStore = {
  pageContext: ChatPageContext | null;
  setPageContext: (c: ChatPageContext | null) => void;
};

const ChatCtx = createContext<ChatContextStore>({
  pageContext: null,
  setPageContext: () => {},
});

export function useChatPageContext() {
  return useContext(ChatCtx);
}

export function ChatContextProvider({ children }: { children: ReactNode }) {
  const [pageContext, setPageContext] = useState<ChatPageContext | null>(null);
  return (
    <ChatCtx.Provider value={{ pageContext, setPageContext }}>
      {children}
    </ChatCtx.Provider>
  );
}
