import { useLayoutEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'

const MIN_TEXTAREA_HEIGHT = 20
const MAX_TEXTAREA_HEIGHT = 200

export function ChatInput({
  onSend,
}: {
  onSend: (text: string) => void
}) {
  const [text, setText] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hasText = text.trim().length > 0

  const resizeTextarea = () => {
    const el = textareaRef.current
    if (!el) return

    el.style.height = 'auto'
    const nextHeight = Math.min(
      Math.max(el.scrollHeight, MIN_TEXTAREA_HEIGHT),
      MAX_TEXTAREA_HEIGHT,
    )
    el.style.height = `${nextHeight}px`
    el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden'
  }

  useLayoutEffect(() => {
    resizeTextarea()
  }, [text])

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed) return

    onSend(trimmed)
    setText('')

    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      resizeTextarea()
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className="
        flex items-end gap-2 rounded-2xl border border-(--line)
        bg-(--surface-strong) px-3 py-1.5
        shadow-[0_1px_0_rgba(255,255,255,0.02),0_10px_24px_rgba(0,0,0,0.08)]
        transition-all duration-200
        focus-within:border-zinc-400/70 focus-within:ring-2 focus-within:ring-zinc-400/25
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
          min-h-2 max-h-40 flex-1 resize-none bg-transparent text-sm leading-6
          text-zinc-900 dark:text-zinc-100
          placeholder:text-zinc-500 dark:placeholder:text-zinc-400
          caret-zinc-900 dark:caret-zinc-100
          outline-none
        "
      />

      <button
        type="button"
        onClick={handleSend}
        disabled={!hasText}
        aria-label="Send message"
        className={`
          inline-flex h-9 w-9 items-center justify-center rounded-xl
          transition-all duration-150
          ${
            hasText
              ? 'bg-teal-500 text-white hover:bg-teal-600 active:scale-95 dark:bg-teal-400 dark:text-zinc-950 dark:hover:bg-teal-300'
              : 'cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-500'
          }
        `}
      >
        <Send size={16} />
      </button>
    </div>
  )
}