import { createContext, useContext } from 'react';
import type { BasicUserInfo, UserInfo } from '#/lib/api/user.ts';
import type { Conversation } from '#/lib/api/conversation.ts';
import type { FriendRequest } from '#/lib/api/friend.ts';

export type UserInfoState = {
  data: UserInfo | undefined;
  isLoading: boolean;
};

type AppContextValue = {
  convoId: string | null;
  setConvoId: (id: string) => void;
};

export const AppStateContext = createContext<AppContextValue | undefined>(undefined);

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within a AppStateProvider');

  return context;
};
