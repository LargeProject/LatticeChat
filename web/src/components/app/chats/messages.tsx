import { memo, useEffect, useMemo, useRef } from 'react';
import type { Message } from '#/lib/api/conversation';

export type MessageRole = 'user' | 'assistant';

type MessageBubbleProps = {
  message: Message;
};

const bubbleBaseClass =
  'max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ring-1';
const userBubbleClass =
  'bg-[var(--accent,#14b8a6)] text-white ring-transparent rounded-br-md';
const assistantBubbleClass =
  'bg-(--surface) text-(--text-primary) ring-(--line) rounded-bl-md';

export const MessageBubble = memo(function MessageBubble({
  message,
}: MessageBubbleProps) {
  // TODO: separate self from non self messages styling
  return (
    <li className={`flex w-full ${'justify-end'}`}>
      <article className={userBubbleClass}>
        <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
      </article>
    </li>
  );
});

type MessageListProps = {
  messages: Message[];
  className?: string;
  smoothScroll?: boolean;
};

const SCROLL_THRESHOLD_PX = 80;

export function MessageList({
  messages,
  className = '',
  smoothScroll = true,
}: MessageListProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const lastMessageId = useMemo(
    () => messages[messages.length - 1]?.id,
    [messages],
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const distanceFromBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    const isNearBottom = distanceFromBottom <= SCROLL_THRESHOLD_PX;

    if (!isNearBottom && messages.length > 1) return;

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: smoothScroll ? 'smooth' : 'auto',
    });
  }, [lastMessageId, messages.length, smoothScroll]);

  return (
    <div
      ref={viewportRef}
      className={`min-h-0 flex-1 overflow-y-auto px-4 py-4 ${className}`}
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
    >
      <ol className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </ol>
    </div>
  );
}
