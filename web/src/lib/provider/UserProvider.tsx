import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { UserContext } from '../context/UserContext.tsx';
import type { UserInfoState } from '../context/UserContext.tsx';
import { fetchUserInfo, type BasicUserInfo } from '#/lib/api/user.ts';
import { fetchFriendRequests } from '#/lib/api/friend.ts';
import type { FriendRequest } from '#/lib/api/friend.ts';
import type { Conversation } from '@latticechat/shared';

export function UserProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfoState>({
    data: undefined,
    isLoading: true,
  });
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<BasicUserInfo[]>([]);

  const refreshUser = async () => {
    console.log('Refreshing User Information...');
    const data = await fetchUserInfo();

    if (!data) {
      setUserInfo({
        data: undefined,
        isLoading: false,
      });
      return;
    }

    setUserInfo({
      data: data.user,
      isLoading: false,
    });

    // Set conversations and friends from the response directly
    setConversations(data.conversations);
    setFriends(data.friends);
    refreshFriendRequests();
  };

  const refreshFriendRequests = async () => {
    console.log('Refreshing Friend Requests...');
    setFriendRequests(await fetchFriendRequests());
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        refreshUser,
        userInfo,
        friends,
        conversations,
        refreshFriendRequests,
        friendRequests,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
