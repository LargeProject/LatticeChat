'use client';
import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import Sidebar from '#/components/app/sidebar';
import ChatLayout from '#/components/app/chats/layout';
import SettingsLayout from '#/components/app/settings/layout';
type Section = 'chats' | 'calls' | 'settings';

function RouteComponent() {
  const [activeSection, setActiveSection] = useState<Section>('chats');
  const content = useMemo(() => {
    if (activeSection === 'settings') return <SettingsLayout />;
    // Calls can reuse chat layout until a dedicated calls screen exists
    return <ChatLayout />;
  }, [activeSection]);

  return (
    <main className="flex h-screen overflow-hidden bg-(--bg-base) text-(--sea-ink)">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={(section) => setActiveSection(section)}
      />
      <div className="flex-1">{content}</div>
    </main>
  );
}

export const Route = createFileRoute('/app')({
  component: RouteComponent,
});
