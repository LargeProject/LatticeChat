import { fetchConversationsBySearch } from '#/lib/api/conversation.ts';
import type { FriendRequest } from '#/lib/api/friend.ts';
import { fetchFriendRequests } from '#/lib/api/friend.ts';
import type { BasicUserInfo } from '#/lib/api/user.ts';
import { fetchUserInfo } from '#/lib/api/user.ts';
import type { Conversation } from '@latticechat/shared';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { UserInfoState } from '../context/UserContext.tsx';
import { UserContext } from '../context/UserContext.tsx';

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
    try {
      const data = await fetchUserInfo();

      setUserInfo({
        data: data.user,
        isLoading: false,
      });

      setConversations(data.conversations);
      setFriends(data.friends);
    } catch (e) {
      setUserInfo({
        data: undefined,
        isLoading: false,
      });
      return;
    }

    refreshFriendRequests();
  };

  const refreshFriendRequests = async () => {
    console.log('Refreshing Friend Requests...');
    setFriendRequests(await fetchFriendRequests());
  };

  const refreshConversations = async (search: string = '') => {
    console.log('Refreshing Conversations...');
    setConversations(await fetchConversationsBySearch(search));
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
        refreshConversations,
        conversations,
        refreshFriendRequests,
        friendRequests,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
