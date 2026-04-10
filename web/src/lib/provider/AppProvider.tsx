import { useState } from 'react';
import type { ReactNode } from 'react';
import { AppStateContext } from '../context/AppStateContext.tsx';

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [convoId, setConvoId] = useState<string | null>(null);

  return (
    <AppStateContext.Provider value={{ convoId, setConvoId }}>
      {children}
    </AppStateContext.Provider>
  );
}
