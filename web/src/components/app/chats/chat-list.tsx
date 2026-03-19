import { useState, useEffect } from 'react'
import type { Chat } from './layout'
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2'
import anonImage from "../../images/anonymous.png"

export function ChatList({
  onSelect,
}: {
  onSelect: (chat: Chat) => void
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (debouncedSearch) {
      // TODO: Perform server-side search with debouncedSearch here
      console.log('Searching server for:', debouncedSearch)
    }
  }, [debouncedSearch])

  const chats: Chat[] = [
    {
      id: '1',
      user: {
        name: 'Anonymous',
        avatar: anonImage,
      },
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-(--border-base) dark:border-gray-800">
        <div className="relative flex items-center">
          <HiOutlineMagnifyingGlass className="absolute left-3 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
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
    </div>
  )
}