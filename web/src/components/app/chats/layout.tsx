import { useMemo } from 'react';
import { ChatList } from './chat-list';
import { ChatView } from './chat-view';
import { EmptyState } from './empty-state';
import { useAppState } from '#/lib/context/AppStateContext';
import { useUser } from '#/lib/context/UserContext';

export default function ChatLayout() {
  const { convoId } = useAppState();
  const { conversations } = useUser();

  const conversation = useMemo(() => {
    return conversations.find((c) => c.id == convoId);
  }, [conversations, convoId]);

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden">
      <aside className="hidden h-full min-h-0 w-72 shrink-0 border-r border-(--line) bg-(--surface) md:flex lg:w-80">
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
          <ChatList />
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 overflow-hidden">
        {!conversation ? (
          <EmptyState />
        ) : (
          <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <ChatView conversation={conversation} />
          </section>
        )}
      </main>
    </div>
  );
}