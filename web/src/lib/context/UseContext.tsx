import { createContext, useContext } from 'react';
import { type UserInfo } from '#/lib/provider/UserProvider.tsx';

type UserContextType = {
  refreshUser: () => Promise<void>;
  userInfo: UserInfo | undefined;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
