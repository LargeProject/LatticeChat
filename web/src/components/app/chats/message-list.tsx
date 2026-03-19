import { MessageBubble } from './message-bubble'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
    </div>
  )
}