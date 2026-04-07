import { useCallback, useEffect, useRef, useState } from 'react';
import { Info, Phone, Video } from 'lucide-react';
import type { Chat } from './layout';
import { MessageList, type Message, type MessageRole } from './messages';
import { ChatInput } from './chat-input';
import { useWebsocket } from '#/lib/hooks/useWebsocket';
import { useAsyncEffect } from '#/components/hooks/useAsyncEffect.ts';
import { fetchConversationMessages } from '#/lib/api/conversation.ts';
import { useUser } from '#/lib/context/UserContext.tsx';

type ChatViewProps = {
  chat: Chat;
  onTogglePanel: () => void;
};

const INITIAL_GREETING = 'Hello 👋';

const createMessage = (role: Message['role'], content: string): Message => ({
  id:
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  role,
  content,
});

// test

export function ChatView({ chat, onTogglePanel }: ChatViewProps) {
  const { userInfo } = useUser();
  const { createMessage: sendMessage } = useWebsocket();
  const [isLoaded, setIsLoaded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    createMessage('assistant', INITIAL_GREETING),
  ]);
  const pendingReplyTimerRef = useRef<number | null>(null);

  // fetch messages
  useAsyncEffect(async () => {
    const fetchedMessages = await fetchConversationMessages(chat.id);

    const chatMessages: Message[] = [];
    for (const fetchedMessage of fetchedMessages) {
      let role: MessageRole = 'assistant';
      if (fetchedMessage.senderId == userInfo?.id) {
        role = 'user';
      }

      const chatMessage: Message = {
        id: fetchedMessage.id,
        role: role,
        content: fetchedMessage.content,
        createdAt: fetchedMessage.createdAt,
      };
      chatMessages.push(chatMessage);
    }

    setMessages(chatMessages);
    setIsLoaded(true);
  }, [chat.id, messages, isLoaded]);

  useEffect(() => {
    //setMessages([createMessage('assistant', INITIAL_GREETING)]);

    if (pendingReplyTimerRef.current !== null) {
      window.clearTimeout(pendingReplyTimerRef.current);
      pendingReplyTimerRef.current = null;
    }

    return () => {
      if (pendingReplyTimerRef.current !== null) {
        window.clearTimeout(pendingReplyTimerRef.current);
        pendingReplyTimerRef.current = null;
      }
    };
  }, [chat.id]);

  const handleSend = useCallback((text: string) => {
    const normalized = text.trim();
    if (!normalized) return;

    setMessages((prev) => [...prev, createMessage('user', normalized)]);

    if (pendingReplyTimerRef.current !== null) {
      window.clearTimeout(pendingReplyTimerRef.current);
    }

    pendingReplyTimerRef.current = window.setTimeout(() => {
      setMessages((prev) => [...prev, createMessage('assistant', 'Bread.')]);
      pendingReplyTimerRef.current = null;
    }, 800);
  }, []);

  return (
    <section
      className="flex flex-1 flex-col overflow-hidden"
      aria-label={`Conversation with ${chat.user.name}`}
    >
      <header className="border-b border-(--line) bg-(--surface) px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-(--text-primary)">
              {chat.user.name}
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
