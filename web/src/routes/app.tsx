import { useContext, useEffect, useMemo, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import Sidebar from '#/components/app/sidebar';
import ChatLayout from '#/components/app/chats/layout';
import SettingsLayout from '#/components/app/settings/layout';
import FriendsLayout from '#/components/app/friends/layout';
import { useUser } from '#/lib/context/UserContext';
import { AppStateProvider } from '#/lib/provider/AppProvider';

type Section = 'chats' | 'friends' | 'calls' | 'settings';

function RouteComponent() {
  const { userInfo } = useUser();
  const navigate = useNavigate();

  const [showMinLoading, setShowMinLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowMinLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const [activeSection, setActiveSection] = useState<Section>('chats');
  const content = useMemo(() => {
    if (activeSection === 'settings') return <SettingsLayout />;
    if (activeSection === 'friends') return <FriendsLayout />;
    // Calls can reuse chat layout until a dedicated calls screen exists
    return <ChatLayout />;
  }, [activeSection]);

  if (userInfo.isLoading || showMinLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-white dark:bg-zinc-950">
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute h-16 w-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 blur-xl dark:opacity-40 opacity-20"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="h-10 w-10 rounded-full border-[3px] border-zinc-200 border-t-cyan-500 dark:border-zinc-800 dark:border-t-cyan-400"
          />
        </div>
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mt-6 text-sm font-mono tracking-widest text-zinc-500 dark:text-zinc-400 uppercase"
        >
          Connecting
        </motion.p>
      </div>
    );
  } else if (!userInfo.data) {
    navigate({ to: '/' });
  }

  return (
    <main className="flex h-screen overflow-hidden bg-white dark:bg-black text-zinc-900 dark:text-zinc-100">
      <AppStateProvider>
        <Sidebar activeSection={activeSection} onSelectSection={setActiveSection} />
        <div className="flex-1">{content}</div>
      </AppStateProvider>
    </main>
  );
}

export const Route = createFileRoute('/app')({
  component: RouteComponent,
});
