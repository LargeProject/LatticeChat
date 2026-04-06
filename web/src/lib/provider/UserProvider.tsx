import { type ReactNode, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext.tsx';
import { fetchUserInfo, type UserInfo } from '#/lib/api/user.ts';

export type FriendRequest = {
  fromId: string;
  toId: string;
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  const refreshUser = async () => {
    console.log('Refreshing User...');
    setUserInfo(await fetchUserInfo());
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ refreshUser, userInfo }}>
      {children}
    </UserContext.Provider>
  );
}
