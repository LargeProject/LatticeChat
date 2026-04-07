import { memo, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import type { Chat } from './layout';
import anonImage from '/anonymous.png';
import { SearchField } from '@heroui/react';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { useUser } from '#/lib/context/UserContext.tsx';
import { useAsyncEffect } from '#/components/hooks/useAsyncEffect.ts';

type ChatListProps = {
  onSelect: (chat: Chat) => void;
};

type ChatRowProps = {
  chat: Chat;
  isSelected: boolean;
  onSelect: (chat: Chat) => void;
};

/*const chats: Chat[] = [
  {
    id: '1',
    user: {
      name: 'Anonymous',
      avatar: anonImage,
    },
  },
  {
    id: '2',
    user: {
      name: 'Cipher',
      avatar: anonImage,
    },
  },
  {
    id: '3',
    user: {
      name: 'Echo',
      avatar: anonImage,
    },
  },
];*/

const ChatRow = memo(function ChatRow({
  chat,
  isSelected,
  onSelect,
}: ChatRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(chat)}
      className={[
        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--line) focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface)',
        isSelected
          ? 'bg-(--link-bg-hover)'
          : 'hover:bg-(--link-bg-hover) active:scale-[0.995]',
      ].join(' ')}
      aria-current={isSelected ? 'page' : undefined}
      aria-label={`Open chat with ${chat.user.name}`}
    >
      <img
        src={chat.user.avatar}
        alt={`${chat.user.name} avatar`}
        className="size-10 shrink-0 rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10"
        loading="lazy"
        decoding="async"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-(--text-primary)">
          {chat.user.name}
        </p>
        <p className="truncate text-xs text-(--text-secondary)">
          Tap to open conversation
        </p>
      </div>
    </button>
  );
});

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function ChatList({ onSelect }: ChatListProps) {
  const { conversations, refreshConversations, refreshUser } = useUser();
  const [ isLoaded, setIsLoaded ] = useState(false);
  const [ chats, setChats ] = useState<Chat[]>([]);

  useAsyncEffect(async () => {
    await refreshUser();
    await refreshConversations();
    setIsLoaded(true);
  });

  useEffect(() => {
    if(!isLoaded) return;

    const newChats: Chat[] = [];
    for (const conversation of conversations) {
      const chat = {
        id: conversation.id,
        user: {
          name: conversation.name,
          avatar: anonImage,
        },
      };
      newChats.push(chat);
    }
    setChats(newChats);
  }, [isLoaded, conversations]);

  const [query, setQuery] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const deferredQuery = useDeferredValue(query);

  const filteredChats = useMemo(() => {
    const q = normalize(deferredQuery);
    if (!q) return chats;

    return chats.filter((chat) => normalize(chat.user.name).includes(q));
  }, [deferredQuery, chats]);

  const handleSelect = (chat: Chat) => {
    setSelectedChatId(chat.id);
    onSelect(chat);
  };

  const resultCountLabel =
    filteredChats.length === 1 ? '1 result' : `${filteredChats.length} results`;

  return (
    <div className="flex h-full flex-col bg-(--surface)">
      <div className="border-b border-(--border-base) p-3 dark:border-gray-800">
        <SearchField
          name="chat-search"
          aria-label="Search chats"
          value={query}
          onChange={setQuery}
        >
          <SearchField.Group className="relative">
            <HiMagnifyingGlass
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)"
              size={16}
            />
            <SearchField.Input
              className="h-10 w-full rounded-xl border border-(--line) bg-(--surface) pl-9 pr-3 text-sm text-(--text-primary) outline-none transition placeholder:text-(--text-secondary) focus:border-(--text-secondary)"
              placeholder="Search by name"
            />
          </SearchField.Group>
        </SearchField>

        <div className="mt-2 px-1 text-xs text-(--text-secondary)">
          {resultCountLabel}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {filteredChats.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-center">
            <div>
              <p className="text-sm font-medium text-(--text-primary)">
                No chats found
              </p>
              <p className="mt-1 text-xs text-(--text-secondary)">
                Try a different keyword.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-1">
            {filteredChats.map((chat) => (
              <li key={chat.id}>
                <ChatRow
                  chat={chat}
                  isSelected={selectedChatId === chat.id}
                  onSelect={handleSelect}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
