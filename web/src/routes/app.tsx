import { useContext, useMemo, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import Sidebar from '#/components/app/sidebar';
import ChatLayout from '#/components/app/chats/layout';
import SettingsLayout from '#/components/app/settings/layout';
import FriendsLayout from '#/components/app/friends/layout';
import { useUser } from '#/lib/context/UserContext';

type Section = 'chats' | 'friends' | 'calls' | 'settings';

function RouteComponent() {
  const { userInfo } = useUser();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<Section>('chats');
  const content = useMemo(() => {
    if (activeSection === 'settings') return <SettingsLayout />;
    if (activeSection === 'friends') return <FriendsLayout />;
    // Calls can reuse chat layout until a dedicated calls screen exists
    return <ChatLayout />;
  }, [activeSection]);

  if (userInfo.isLoading) {
    return <div>Loading!</div>;
  } else if (!userInfo.data) {
    navigate({ to: '/' });
  }

  return (
    <main className="flex h-screen overflow-hidden bg-(--bg-base) text-(--sea-ink)">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />
      <div className="flex-1">{content}</div>
    </main>
  );
}

export const Route = createFileRoute('/app')({
  component: RouteComponent,
});
