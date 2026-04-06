import { type ReactNode, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext.tsx';
import { type BasicUserInfo, fetchUserInfo, type UserInfo } from '#/lib/api/user.ts';
import { fetchFriendRequests, fetchFriends, type FriendRequest } from '#/lib/api/friend.ts';
import { type Conversation, fetchConversations } from '#/lib/api/conversation.ts';

export function UserProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<BasicUserInfo[]>([]);

  const refreshUser = async () => {
    console.log('Refreshing User Information...');
    setUserInfo(await fetchUserInfo());
  };

  const refreshFriends = async () => {
    console.log('Refreshing Friends...');
    if (userInfo == null) return;
    setFriends(await fetchFriends());
  }
  
  const refreshFriendRequests = async () => {
    console.log('Refreshing Friend Requests...');
    setFriendRequests(await fetchFriendRequests());
  };

  const refreshConversations = async () => {
    console.log('Refreshing Conversations...');
    if(userInfo == null) return;
    setConversations(await fetchConversations(userInfo.conversationIds));
  }

  useEffect(() => {
    (async () => {
      await refreshUser();
      refreshFriends()
      refreshConversations();
      refreshFriendRequests();
    })();
  }, []);

  return (
    <UserContext.Provider value={{
      refreshUser, userInfo,
      refreshFriends, friends,
      refreshConversations, conversations,
      refreshFriendRequests, friendRequests,
    }}>
      {children}
    </UserContext.Provider>
  );
}
