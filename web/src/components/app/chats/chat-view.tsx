import { useState } from 'react'
import type { Chat } from './layout'
import { MessageList, type Message } from './messages'
import { ChatInput } from './chat-input'

export function ChatView({
  chat,
  onTogglePanel,
}: {
  chat: Chat
  onTogglePanel: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello 👋',
    },
  ])

  const handleSend = (text: string) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    }

    setMessages((prev) => [...prev, newMessage])

    // fake response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Got it.',
        },
      ])
    }, 500)
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-(--line) p-4">
        <span>{chat.user.name}</span>

        <button onClick={onTogglePanel} className="text-xs">
          Toggle Info
        </button>
      </div>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input */}
      <ChatInput onSend={handleSend} />
    </div>
  )
}