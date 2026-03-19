import type { Chat } from './layout'

export function ChatList({
  onSelect,
}: {
  onSelect: (chat: Chat) => void
}) {
  const chats: Chat[] = [
    {
      id: '1',
      user: {
        name: 'Anonymous',
        avatar: 'https://i.pravatar.cc/',
      },
    },
  ]

  return (
    <div>
      {chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => onSelect(chat)}
          className="flex w-full items-center gap-3 px-4 py-3 hover:bg-(--link-bg-hover)"
        >
          <img src={chat.user.avatar} className="size-10 rounded-full" />
          <span className="text-sm">{chat.user.name}</span>
        </button>
      ))}
    </div>
  )
}