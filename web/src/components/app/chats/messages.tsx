export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[70%] rounded-2xl px-4 py-2 text-sm
          ${
            isUser
              ? 'bg-[#5a9fd3] text-white'
              : 'bg-[#787878] text-white'
          }
        `}
      >
        {message.content}
      </div>
    </div>
  )
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