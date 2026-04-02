import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import Sidebar from '#/components/app/sidebar';
import ChatLayout from '#/components/app/chats/layout';
import SettingsLayout from '#/components/app/settings/layout';
import FriendsLayout from '#/components/app/friends/layout';
import { UserProvider } from '#/lib/provider/UserProvider.tsx';

type Section = 'chats' | 'friends' | 'calls' | 'settings';

function RouteComponent() {
  const [activeSection, setActiveSection] = useState<Section>('chats');
  const content = useMemo(() => {
    if (activeSection === 'settings') return <SettingsLayout />;
    if (activeSection === 'friends') return <FriendsLayout />;
    // Calls can reuse chat layout until a dedicated calls screen exists
    return <ChatLayout />;
  }, [activeSection]);

  return (
    <main className="flex h-screen overflow-hidden bg-(--bg-base) text-(--sea-ink)">
      <UserProvider>
        <Sidebar
          activeSection={activeSection}
          onSelectSection={(section) => setActiveSection(section)}
        />
        <div className="flex-1">{content}</div>
      </UserProvider>
    </main>
  );
}

export const Route = createFileRoute('/app')({
  component: RouteComponent,
});
