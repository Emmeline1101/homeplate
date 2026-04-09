'use client';

import { useEffect } from 'react';
import { useChatPageContext, type ChatPageContext } from '../lib/chatContextStore';

export default function SetChatContext(props: ChatPageContext) {
  const { setPageContext } = useChatPageContext();

  useEffect(() => {
    setPageContext(props);
    return () => setPageContext(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.title, props.cuisine_tag, props.emoji]);

  return null;
}
