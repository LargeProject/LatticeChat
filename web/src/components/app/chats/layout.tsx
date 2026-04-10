import { useEffect, useState } from 'react';
import { ChatList } from './chat-list';
import { ChatView } from './chat-view';
import { EmptyState } from './empty-state';
import { useAppState } from '#/lib/context/AppStateContext';

const PANEL_BREAKPOINT = 1280;

export default function ChatLayout() {
  const { convoId, setConvoId } = useAppState();
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [userToggled, setUserToggled] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(() =>
    typeof window !== 'undefined'
      ? window.innerWidth >= PANEL_BREAKPOINT
      : true,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(`(min-width: ${PANEL_BREAKPOINT}px)`);

    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsWideScreen(event.matches);
    };

    setIsWideScreen(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  useEffect(() => {
    if (!convoId) return;

    if (!isWideScreen) {
      setIsPanelOpen(false);
      return;
    }

    if (!userToggled) {
      setIsPanelOpen(true);
    }
  }, [isWideScreen, convoId, userToggled]);

  const togglePanel = () => {
    if (!isWideScreen) return;
    setIsPanelOpen((prev) => !prev);
    setUserToggled(true);
  };

  const showPanel = Boolean(convoId && isWideScreen && isPanelOpen);

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden">
      <aside className="hidden h-full min-h-0 w-72 shrink-0 border-r border-(--line) bg-(--surface) md:flex lg:w-80">
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
          <ChatList />
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 overflow-hidden">
        {!convoId ? (
          <EmptyState />
        ) : (
          <>
            <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <ChatView conversationId={convoId} onTogglePanel={togglePanel} />
            </section>

            <aside
              className={[
                'hidden h-full shrink-0 border-l border-(--line) bg-(--surface)',
                'xl:block',
                'transition-[width,opacity] duration-300 ease-out',
                showPanel
                  ? 'w-72 opacity-100'
                  : 'w-0 opacity-0 pointer-events-none',
              ].join(' ')}
              aria-hidden={!showPanel}
            >
              {/* <div
                className={[
                  'h-full w-72 transition-transform duration-300 ease-out',
                  showPanel ? 'translate-x-0' : 'translate-x-4',
                ].join(' ')}
              >
                {selectedChatId ? (
                  <UserInfoPanel user={selectedChatId.user} />
                ) : null}
              </div> */}
            </aside>
          </>
        )}
      </main>
    </div>
  );
}
