import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { UserContext } from '../context/UserContext.tsx';
import type { UserInfoState } from '../context/UserContext.tsx';
import { fetchUserInfo } from '#/lib/api/user.ts';
import type { BasicUserInfo } from '#/lib/api/user.ts';
import { fetchFriendRequests, fetchFriends } from '#/lib/api/friend.ts';
import type { FriendRequest } from '#/lib/api/friend.ts';
import { fetchConversations } from '#/lib/api/conversation.ts';
import type { Conversation } from '#/lib/api/conversation.ts';

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
      data,
      isLoading: false,
    });

    refreshFriends();
    refreshConversations();
    refreshFriendRequests();
  };

  const refreshFriends = async () => {
    console.log('Refreshing Friends...');
    if (userInfo.data == null) return;
    setFriends(await fetchFriends(userInfo.data.friendIds));
  };
  const refreshConversations = async () => {
    console.log('Refreshing Conversations...');
    if (userInfo.data == null) return;
    setConversations(await fetchConversations(userInfo.data.conversationIds));
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
        refreshFriends,
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
