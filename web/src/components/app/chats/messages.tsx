import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { Message } from '#/lib/api/conversation';
import type { BasicUserInfo } from '#/lib/api/user';

export type MessageRole = 'user' | 'assistant';
const SYSTEM_USER_ID = 'system';

type MessageBubbleProps = {
  message: Message;
  isOwnMessage: boolean;
  members?: BasicUserInfo[];
};

const bubbleBaseClass = 'max-w-[100%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ring-1';
const userBubbleClass = 'bg-[var(--accent,#14b8a6)] text-white ring-transparent rounded-br-md';
const assistantBubbleClass = 'bg-(--surface) text-(--text-primary) ring-(--line) rounded-bl-md';

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="h-9 w-9 flex-none rounded-full bg-(--line) flex items-center justify-center text-xs font-semibold text-(--text-primary)">
      {initials}
    </div>
  );
}

export const MessageBubble = memo(function MessageBubble({ message, isOwnMessage, members = [] }: MessageBubbleProps) {
  if (message.senderId === SYSTEM_USER_ID) {
    return (
      <li className="flex w-full justify-center">
        <div className="text-gray-400 italic text-xs font-normal py-1 px-2 text-center w-full select-none">
          {message.content}
        </div>
      </li>
    );
  }

  const bubbleClass = isOwnMessage ? userBubbleClass : assistantBubbleClass;
  const alignment = isOwnMessage ? 'justify-end' : 'justify-start';

  const sender = members.find((m) => m.id === message.senderId);
  const senderName = sender?.name ?? 'Unknown';

  if (isOwnMessage) {
    return (
      <li className={`flex w-full ${alignment}`}>
        <article className={`${bubbleBaseClass} ${bubbleClass}`}>
          <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
        </article>
      </li>
    );
  }

  return (
    <li className={`flex w-full ${alignment}`}>
      <div className="flex items-start gap-3">
        <Avatar name={senderName} />
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-medium text-(--text-primary)">{senderName}</span>
            <span className="text-xs text-(--text-secondary)">·</span>
          </div>
          <article className={`${bubbleBaseClass} ${bubbleClass}`}>
            <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
          </article>
        </div>
      </div>
    </li>
  );
});

type MessageListProps = {
  messages: Message[];
  currentUserId: string;
  members?: BasicUserInfo[];
  className?: string;
  smoothScroll?: boolean;
};

const SCROLL_THRESHOLD_PX = 80;

export function MessageList({
  messages,
  currentUserId,
  members = [],
  className = '',
  smoothScroll = true,
}: MessageListProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const lastMessageId = useMemo(() => messages[messages.length - 1]?.id, [messages]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateIsNearBottom = () => {
      const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      setIsUserNearBottom(distanceFromBottom <= SCROLL_THRESHOLD_PX);
    };

    updateIsNearBottom();
    viewport.addEventListener('scroll', updateIsNearBottom);

    return () => {
      viewport.removeEventListener('scroll', updateIsNearBottom);
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    if (!isUserNearBottom && messages.length > 1) return;

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: smoothScroll ? 'smooth' : 'auto',
    });
  }, [lastMessageId, messages.length, smoothScroll, isUserNearBottom]);

  return (
    <div
      ref={viewportRef}
      className={`min-h-0 flex-1 overflow-y-auto px-2 py-4 ${className}`}
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
    >
      <ol className="flex w-full flex-col gap-3">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={message.senderId === currentUserId}
            members={members}
          />
        ))}
      </ol>
    </div>
  );
}
