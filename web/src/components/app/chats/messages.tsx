import { memo, useEffect, useMemo, useRef } from 'react';
import type { Message } from '#/lib/api/conversation';
import type { BasicUserInfo } from '#/lib/api/user';

export type MessageRole = 'user' | 'assistant';
const SYSTEM_USER_ID = 'system';

type MessageBubbleProps = {
  message: Message;
  isOwnMessage: boolean;
  members?: BasicUserInfo[];
};

const bubbleBaseClass = 'max-w-[100%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-sm';
const userBubbleClass = 'bg-gradient-to-br from-cyan-500/90 to-blue-600/90 text-white ring-1 ring-white/10 rounded-br-md shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-md';
const assistantBubbleClass = 'bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md text-zinc-900 dark:text-zinc-100 ring-1 ring-zinc-200 dark:ring-zinc-800 rounded-bl-md';

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="h-9 w-9 flex-none rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 ring-1 ring-zinc-300 dark:ring-zinc-600/50 shadow-inner flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-200">
      {initials}
    </div>
  );
}

export const MessageBubble = memo(function MessageBubble({ message, isOwnMessage, members = [] }: MessageBubbleProps) {
  if (message.senderId === SYSTEM_USER_ID) {
    return (
      <li className="flex w-full justify-center">
        <div className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest py-2 px-3 text-center w-full select-none">
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
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{senderName}</span>
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
  const isNearBottomRef = useRef(true);
  const lastMessageId = useMemo(() => messages[messages.length - 1]?.id, [messages]);
  const prevMessageCountRef = useRef(messages.length);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateIsNearBottom = () => {
      const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      isNearBottomRef.current = distanceFromBottom <= SCROLL_THRESHOLD_PX;
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

    const isNewMessage = messages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (!isNearBottomRef.current && isNewMessage) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'auto',
        });
      });
    });
  }, [lastMessageId, messages.length, smoothScroll]);

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
