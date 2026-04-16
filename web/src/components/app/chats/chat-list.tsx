import { memo, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { SearchField } from '@heroui/react';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { useUser } from '#/lib/context/UserContext.tsx';
import { useAsyncEffect } from '#/components/hooks/useAsyncEffect.ts';
import type { Conversation } from '#/lib/api/conversation';
import { useAppState } from '#/lib/context/AppStateContext';
import { getConversationName } from '#/lib/util/conversation';

type ChatRowProps = {
  conversation: Conversation;
  isSelected: boolean;
};

const ChatIcon = memo(function ChatIcon({ conversation, name }: { conversation: Conversation; name: string }) {
  return (
    <>
      {conversation.isDirectMessage ? (
        <div
          className="absolute inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 ring-1 ring-zinc-300 dark:ring-zinc-600/50 shadow-inner"
          title={name}
        >
          {name
            .split(' ')
            .map((p) => p[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </div>
      ) : (
        conversation.members.slice(0, 3).map((m, idx) => (
          <div
            key={m.id}
            className="absolute inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 ring-1 ring-zinc-300 dark:ring-zinc-600/50 shadow-inner"
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
        ))
      )}
    </>
  );
});

const ChatRow = function ChatRow({ conversation, isSelected }: ChatRowProps) {
  const { setConvoId } = useAppState();
  const { userInfo } = useUser();
  const name = useMemo(() => {
    if (!userInfo.data) return '';
    return getConversationName(userInfo.data, conversation);
  }, [conversation, userInfo.data]);

  function onClick() {
    setConvoId(conversation.id);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950',
        isSelected ? 'bg-zinc-100 dark:bg-zinc-800/50 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700/50' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60 active:scale-[0.98]',
      ].join(' ')}
      aria-current={isSelected ? 'page' : undefined}
    >
      <div
        className="relative flex h-9 shrink-0"
        style={{ width: conversation.isDirectMessage ? 36 : 36 + (Math.min(conversation.members.length, 3) - 1) * 16 }}
      >
        <ChatIcon conversation={conversation} name={name} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{name}</p>
        {conversation.isDirectMessage ? (
          <></>
        ) : (
          <p className="truncate text-[11px] font-mono text-zinc-500">{conversation.members.length} members</p>
        )}
      </div>
      {isSelected && (
        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
      )}
    </button>
  );
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function ChatList() {
  const { conversations, refreshConversations, refreshUser } = useUser();
  const { convoId } = useAppState();
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
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950 relative border-r border-zinc-200 dark:border-zinc-900/50 z-20 shadow-2xl">
      <div className="border-b border-zinc-200 dark:border-zinc-900/80 p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <SearchField name="chat-search" aria-label="Search chats" value={query} onChange={setQuery}>
          <SearchField.Group className="relative">
            <HiMagnifyingGlass
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
              size={16}
            />
            <SearchField.Input
              className="h-10 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black pl-9 pr-3 text-sm font-medium text-zinc-900 dark:text-zinc-200 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-1 focus:ring-zinc-400/50 dark:focus:ring-zinc-600/50 shadow-inner"
              placeholder="Search by name"
            />
          </SearchField.Group>
        </SearchField>

        <div className="mt-3 px-1 text-[11px] font-mono text-zinc-500 tracking-wider uppercase">{resultCountLabel}</div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {conversations.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-center">
            <div>
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No chats found</p>
              <p className="mt-1 text-xs font-mono text-zinc-500">Try a different keyword.</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <ChatRow conversation={conversation} isSelected={convoId === conversation.id} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
