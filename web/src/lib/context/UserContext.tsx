import { createContext, useContext } from 'react';
import type { BasicUserInfo, UserInfo } from '#/lib/api/user.ts';
import type { Conversation } from '#/lib/api/conversation.ts';
import type { FriendRequest } from '#/lib/api/friend.ts';

export type UserInfoState = {
  data: UserInfo | undefined;
  isLoading: boolean;
};

type UserContextType = {
  refreshUser: () => Promise<void>;
  userInfo: UserInfoState;

  refreshFriends: () => Promise<void>;
  friends: BasicUserInfo[];

  refreshConversations: () => Promise<void>;
  conversations: Conversation[];

  refreshFriendRequests: () => Promise<void>;
  friendRequests: FriendRequest[];
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
