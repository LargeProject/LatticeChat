import { type ReactNode, useEffect, useState } from 'react';
import { authClient } from '#/lib/auth.ts';
import { bufferArrayToHexStringArray } from '#/lib/utils.ts';
import { UserContext } from '../context/UseContext';

export type UserInfo = {
  username: string;
  usernameDisplay: string;
  email: string;
  biography: string;
  friendIds: string[];
  conversationIds: string[];
  createdAt: Date;
};

export type FriendRequest = {
  fromId: string;
  toId: string;
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  const refreshUser = async () => {
    const { data } = await authClient.getSession({
      fetchOptions: {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('jwt'),
        },
      },
    });
    if (data == null) return;

    // TODO: move server auth.ts to shared dir to share auth user-schema
    const userData = data.user as any;
    setUserInfo({
      email: userData.email,
      username: userData.username,
      usernameDisplay: userData.usernameDisplay,
      biography: userData.biography,
      friendIds: bufferArrayToHexStringArray(userData.friends),
      conversationIds: bufferArrayToHexStringArray(userData.conversations),
      createdAt: userData.createdAt,
    });
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
