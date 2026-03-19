import { useState } from 'react'

export function ChatInput({
  onSend,
}: {
  onSend: (text: string) => void
}) {
  const [text, setText] = useState('')

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text)
    setText('')
  }

  return (
    <div className="border-t border-(--line) p-3">
      <div className="flex items-center gap-2 rounded-xl border border-(--line) bg-(--surface) px-3 py-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend()
          }}
          className="flex-1 bg-transparent outline-none text-sm"
          placeholder="Speak freely..."
        />
        <button onClick={handleSend} className="text-[#52525b]">
          Send
        </button>
      </div>
    </div>
  )
}