import { useState } from 'react'
import { ChatList } from './chat-list'
import { ChatView } from './chat-view'
import { UserInfoPanel } from './user-info'
import { EmptyState } from './empty-state'

export type Chat = {
  id: string
  user: {
    name: string
    avatar: string
  }
}

export default function ChatLayout() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [userToggled, setUserToggled] = useState(false)

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat)

    if (!userToggled) {
      setIsPanelOpen(true)
    }
  }

  const togglePanel = () => {
    setIsPanelOpen((prev) => !prev)
    setUserToggled(true)
  }

  return (
    <div className="flex flex-1">
      {/* Chat list */}
      <div className="w-80 border-r border-(--line)">
        <ChatList onSelect={handleSelectChat} />
      </div>

      {/* Main */}
      <div className="flex flex-1">
        {!selectedChat ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex flex-1 flex-col">
              <ChatView chat={selectedChat} onTogglePanel={togglePanel} />
            </div>

            <div
              className={`
                transition-all duration-300 overflow-hidden
                ${isPanelOpen ? 'w-72 opacity-100' : 'w-0 opacity-0'}
              `}
            >
              <UserInfoPanel user={selectedChat.user} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}