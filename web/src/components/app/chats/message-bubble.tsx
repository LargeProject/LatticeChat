import type { Message } from './message-list'

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[70%] rounded-2xl px-4 py-2 text-sm
          ${isUser
            ? 'bg-[#5a9fd3] text-white'
            : 'bg-[#787878] text-white'}
        `}
      >
        {message.content}
      </div>
    </div>
  )
}