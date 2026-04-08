import {
  memo,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Chat } from './layout';
import anonImage from '/anonymous.png';
import { SearchField } from '@heroui/react';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { useUser } from '#/lib/context/UserContext.tsx';
import { useAsyncEffect } from '#/components/hooks/useAsyncEffect.ts';
import type { Conversation } from '#/lib/api/conversation';
import { useConversation } from '#/components/hooks/useConversation';

type ChatListProps = {
  onSelect: (conversationId: string) => void;
};

type ChatRowProps = {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversationId: string) => void;
};

const testData: Chat[] = [
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
];

const ChatRow = memo(function ChatRow({
  conversation,
  isSelected,
  onSelect,
}: ChatRowProps) {
  const { name } = useConversation(conversation);

  function onClick() {
    onSelect(conversation.id);
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--line) focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface)',
        isSelected
          ? 'bg-(--link-bg-hover)'
          : 'hover:bg-(--link-bg-hover) active:scale-[0.995]',
      ].join(' ')}
      aria-current={isSelected ? 'page' : undefined}
    >
      <img
        // TODO: pull these in from use conversation, not chat
        // src={chat.user.avatar}
        // alt={`${chat.user.name} avatar`}
        className="size-10 shrink-0 rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10"
        loading="lazy"
        decoding="async"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-(--text-primary)">
          {conversation.name}
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
  const { conversations, refreshConversations, refreshUser, friends } =
    useUser();
  const [isLoaded, setIsLoaded] = useState(false);

  useAsyncEffect(async () => {
    await refreshUser();
    await refreshConversations();
    setIsLoaded(true);
  });

  const [query, setQuery] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const deferredQuery = useDeferredValue(query);

  const filteredConversations = useMemo(() => {
    const q = normalize(deferredQuery);
    if (!q) return conversations;

    return conversations.filter((chat) => normalize(chat.name).includes(q));
  }, [deferredQuery, conversations]);

  const resultCountLabel =
    filteredConversations.length === 1
      ? '1 result'
      : `${filteredConversations.length} results`;

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
        {filteredConversations.length === 0 ? (
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
            {filteredConversations.map((chat) => (
              <li key={chat.id}>
                <ChatRow
                  conversation={chat}
                  isSelected={selectedChatId === chat.id}
                  onSelect={setSelectedChatId}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
