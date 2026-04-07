import { type BasicUserInfo, fetchBasicUserInfo } from '#/lib/api/user.ts';
import { HttpError } from '#/lib/util/error.ts';
import { getLocalJWT, getLocalUserId } from '#/lib/util/storage.ts';

export type Conversation = {
  id: string,
  name: string,
  ownerId?: string,
  members: BasicUserInfo[]
}

export type Message = {
  id: string,
  senderId: string,
  conversationId: string,
  content: string,
  createdAt: Date,
}

export async function fetchConversation(
  conversationId: string,
): Promise<Conversation | null> {
  const userId = getLocalUserId();
  const jwt = getLocalJWT();
  const response = await fetch(
    import.meta.env.VITE_API_BASE_URL + '/users/' + userId + '/conversations/' + conversationId,
    {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + jwt,
      }
    },
  );
  const body = await response.json();
  if (!response.ok) {
    throw new HttpError(response.status, body.code, body.message);
  }

  const rawConversation = body.conversation;

  let members: BasicUserInfo[] = [];
  for (const memberId of rawConversation.members) {
    const member = await fetchBasicUserInfo(memberId);
    if (member != null) {
      members.push(member);
    }
  }

  // set conversation name to receiving user if private
  let privateName = null;
  if(rawConversation.owner == null) { // if conversation is private
    const receivingMember = members.find(user => user.id != userId);
    if(receivingMember != null) {
      privateName = receivingMember.displayUsername;
    }
  }

  return {
    id: rawConversation.id,
    name: privateName ?? rawConversation.name,
    ownerId: rawConversation.owner,
    members: members
  };
}

export async function fetchConversations(conversationIds: string[]): Promise<Conversation[]> {

  const conversations: Conversation[] = [];
  for(const conversationId of conversationIds) {
    const conversation = await fetchConversation(conversationId);
    if(conversation != null) {
      conversations.push(conversation);
    }
  }

  return conversations;
}

export async function fetchConversationMessages(conversationId: string): Promise<Message[]>{
  const userId = getLocalUserId();
  const jwt = getLocalJWT();
  const response = await fetch(
    import.meta.env.VITE_API_BASE_URL + '/users/' + userId + '/conversations/' + conversationId + '/messages',
    {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + jwt,
      },
    },
  );
  const body = await response.json();
  if (!response.ok) {
    throw new HttpError(response.status, body.code, body.message);
  }

  const rawMessages = body.message;

  let messages: Message[] = [];
  for (const rawMessage of rawMessages) {
    const message: Message = {
      id: rawMessage.id,
      senderId: rawMessage.sender,
      conversationId: rawMessage.conversation,
      content: rawMessage.content,
      createdAt: rawMessage.createdAt
    }
    messages.push(message);
  }

  return messages;
}
