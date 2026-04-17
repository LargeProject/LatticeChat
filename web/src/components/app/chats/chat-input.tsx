import { useLayoutEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

const MIN_TEXTAREA_HEIGHT = 20;
const MAX_TEXTAREA_HEIGHT = 200;

export function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasText = text.trim().length > 0;

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto';
    const nextHeight = Math.min(Math.max(el.scrollHeight, MIN_TEXTAREA_HEIGHT), MAX_TEXTAREA_HEIGHT);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
  };

  useLayoutEffect(() => {
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setText('');

    requestAnimationFrame(() => {
      resizeTextarea();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="
        flex items-end gap-3 rounded-[1.25rem] border border-zinc-300 dark:border-zinc-800/80
        bg-white/80 dark:bg-zinc-900/50 px-4 py-2
        transition-all duration-300 ease-out
        focus-within:border-zinc-400 dark:focus-within:border-zinc-600/80 focus-within:bg-white dark:focus-within:bg-zinc-900/80 focus-within:shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:focus-within:shadow-[0_0_20px_rgba(255,255,255,0.05)]
      "
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        placeholder="Speak freely"
        aria-label="Message input"
        className="
          min-h-[24px] max-h-40 flex-1 resize-none bg-transparent text-[15px] leading-[24px]
          text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-medium
          caret-cyan-500 dark:caret-cyan-400 outline-none my-1
        "
      />

      <button
        type="button"
        onClick={handleSend}
        disabled={!hasText}
        aria-label="Send message"
        className={`
          relative group inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden
          transition-all duration-300 ease-out
          ${
            hasText
              ? 'text-white shadow-lg active:scale-95'
              : 'cursor-not-allowed bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-600'
          }
        `}
      >
        {hasText && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-purple-500 to-blue-500 opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-60 blur-md transition-opacity" />
          </>
        )}
        <Send size={18} className="relative z-10 ml-0.5" />
      </button>
    </div>
  );
}
