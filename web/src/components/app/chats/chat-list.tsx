import { memo, useDeferredValue, useMemo, useState } from 'react';
import { SearchField } from '@heroui/react';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { useUser } from '#/lib/context/UserContext.tsx';
import { useAsyncEffect } from '#/components/hooks/useAsyncEffect.ts';
import { type Conversation, fetchConversationsBySearch } from '#/lib/api/conversation';
import { useAppState } from '#/lib/context/AppStateContext';

type ChatRowProps = {
  conversation: Conversation;
  isSelected: boolean;
};

const ChatRow = memo(function ChatRow({ conversation, isSelected }: ChatRowProps) {
  const { setConvoId } = useAppState();
  function onClick() {
    setConvoId(conversation.id);
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--line) focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface)',
        isSelected ? 'bg-(--link-bg-hover)' : 'hover:bg-(--link-bg-hover) active:scale-[0.995]',
      ].join(' ')}
      aria-current={isSelected ? 'page' : undefined}
    >
      <div className="relative flex shrink-0" style={{ width: 40 }}>
        {conversation.members?.slice(0, 3).map((m, idx) => (
          <div
            key={m.id}
            className="absolute inline-flex h-9 w-9 items-center justify-center rounded-full bg-(--line) text-xs font-semibold text-(--text-primary) ring-1"
            style={{ left: idx * 16 }}
            title={m.name}
          >
            {m.name
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </div>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-(--text-primary)">{conversation.name}</p>
        <p className="truncate text-xs text-(--text-secondary)">Tap to open conversation</p>
      </div>
    </button>
  );
});

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function ChatList() {
  const { conversations, refreshConversations, refreshUser } = useUser();
  const [isLoaded, setIsLoaded] = useState(false);

  useAsyncEffect(async () => {
    await refreshUser();
    setIsLoaded(true);
  });

  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  useAsyncEffect(async () => {
    const q = normalize(deferredQuery);
    await refreshConversations(q);
  }, [deferredQuery]);

  const resultCountLabel = conversations.length === 1 ? '1 result' : `${conversations.length} results`;

  return (
    <div className="flex h-full flex-col bg-(--surface)">
      <div className="border-b border-(--border-base) p-3 dark:border-gray-800">
        <SearchField name="chat-search" aria-label="Search chats" value={query} onChange={setQuery}>
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

        <div className="mt-2 px-1 text-xs text-(--text-secondary)">{resultCountLabel}</div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-center">
            <div>
              <p className="text-sm font-medium text-(--text-primary)">No chats found</p>
              <p className="mt-1 text-xs text-(--text-secondary)">Try a different keyword.</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <ChatRow conversation={conversation} isSelected={false} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
