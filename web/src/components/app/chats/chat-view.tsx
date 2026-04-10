import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Info, Phone, Video } from 'lucide-react';
import type * as layout from './layout';
import { MessageList } from './messages';
import { ChatInput } from './chat-input';
import { useWebsocket } from '#/lib/hooks/useWebsocket';
import { useAsyncEffect } from '#/components/hooks/useAsyncEffect.ts';
import { fetchConversationMessages } from '#/lib/api/conversation.ts';
import { useUser } from '#/lib/context/UserContext.tsx';
import { useConversation } from '#/components/hooks/useConversation';

type ChatViewProps = {
  conversationId: string;
  onTogglePanel: () => void;
};

export function ChatView({ conversationId, onTogglePanel }: ChatViewProps) {
  const { conversations } = useUser();
  const { createMessage: sendMessage } = useWebsocket();

  const conversation = useMemo(() => {
    return conversations.find((c) => c.id == conversationId);
  }, [conversations]);

  if (!conversation) {
    return <>Conversation not found!</>;
  }

  const { name, messages } = useConversation(conversation);

  const handleSend = useCallback((text: string) => {
    const normalized = text.trim();
    if (!normalized) return;
  }, []);

  return (
    <section
      className="flex flex-1 flex-col overflow-hidden"
      aria-label={`Conversation with ${name}`}
    >
      <header className="border-b border-(--line) bg-(--surface) px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-(--text-primary)">
              {name}
            </h2>
            <p className="truncate text-xs text-(--text-secondary)">
              End-to-end encrypted conversation
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-(--text-secondary) transition-colors hover:bg-(--link-bg-hover) hover:text-(--text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--line)"
              aria-label="Start voice call"
              title="Voice call"
            >
              <Phone size={16} />
            </button>

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-(--text-secondary) transition-colors hover:bg-(--link-bg-hover) hover:text-(--text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--line)"
              aria-label="Start video call"
              title="Video call"
            >
              <Video size={16} />
            </button>

            <button
              type="button"
              onClick={onTogglePanel}
              className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-(--text-secondary) transition-colors hover:bg-(--link-bg-hover) hover:text-(--text-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--line)"
              aria-label="Toggle user info panel"
              aria-pressed={false}
              title="Toggle info"
            >
              <Info size={16} />
              <span className="text-xs font-medium">Info</span>
            </button>
          </div>
        </div>
      </header>

      <MessageList messages={messages} />

      <div className="border-t border-(--line) bg-(--surface)">
        <ChatInput onSend={handleSend} />
      </div>
    </section>
  );
}
