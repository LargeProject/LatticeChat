import { useContext, useEffect, useMemo, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '#/components/app/sidebar';
import ChatLayout from '#/components/app/chats/layout';
import SettingsLayout from '#/components/app/settings/layout';
import FriendsLayout from '#/components/app/friends/layout';
import { useUser } from '#/lib/context/UserContext';
import { AppStateProvider } from '#/lib/provider/AppProvider';

type Section = 'chats' | 'friends' | 'calls' | 'settings';

const SECTION_ORDER: Section[] = ['chats', 'friends', 'calls', 'settings'];

const tabVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir === 1 ? 100 : -100,
    scale: 0.95,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir === 1 ? -100 : 100,
    scale: 0.95,
  }),
};

function RouteComponent() {
  const { userInfo } = useUser();
  const navigate = useNavigate();

  const [showMinLoading, setShowMinLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowMinLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const [activeSection, setActiveSection] = useState<Section>('chats');
  const [direction, setDirection] = useState(1);

  const handleSectionChange = (newSection: Section) => {
    const currentIndex = SECTION_ORDER.indexOf(activeSection);
    const newIndex = SECTION_ORDER.indexOf(newSection);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveSection(newSection);
  };

  const content = useMemo(() => {
    if (activeSection === 'settings') return <SettingsLayout />;
    if (activeSection === 'friends') return <FriendsLayout />;
    // Calls can reuse chat layout until a dedicated calls screen exists
    return <ChatLayout />;
  }, [activeSection]);

  if (userInfo.isLoading || showMinLoading) {
    return (
      <motion.div
        key="loading"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        className="flex h-[100dvh] w-screen flex-col items-center justify-center bg-white dark:bg-zinc-950"
      >
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute h-16 w-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 blur-xl dark:opacity-40 opacity-20"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="h-10 w-10 rounded-full border-[3px] border-zinc-200 border-t-cyan-500 dark:border-zinc-800 dark:border-t-cyan-400"
          />
        </div>
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-6 text-sm font-mono tracking-widest text-zinc-500 dark:text-zinc-400 uppercase"
        >
          Connecting
        </motion.p>
      </motion.div>
    );
  } else if (!userInfo.data) {
    navigate({ to: '/' });
  }

  return (
    <motion.main
      key="app"
      className="flex h-[100dvh] overflow-hidden bg-white dark:bg-black text-zinc-900 dark:text-zinc-100"
      initial={{ opacity: 0, scale: 0.6, y: 80 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -40 }}
      transition={{
        duration: 1,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <AppStateProvider>
        <Sidebar activeSection={activeSection} onSelectSection={handleSectionChange} />
        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeSection}
              custom={direction}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              {content}
            </motion.div>
          </AnimatePresence>
        </div>
      </AppStateProvider>
    </motion.main>
  );
}

export const Route = createFileRoute('/app')({
  component: RouteComponent,
});
