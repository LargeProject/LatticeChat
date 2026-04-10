import { fetchConversationMessages } from '#/lib/api/conversation';
import type { Conversation, Message } from '#/lib/api/conversation';
import { useUser } from '#/lib/context/UserContext';
import { useWebsocket } from '#/lib/hooks/useWebsocket';
import { useWebsocketListener } from '#/lib/hooks/useWebsocketListener';
import { useEffect, useMemo, useState } from 'react';
import type * as contracts from '@latticechat/shared';
import { getConversationName } from '#/lib/util/conversation';

export function useConversation(conversation: Conversation) {
  const { userInfo } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const { isAuthenticated } = useWebsocket();
  const name = useMemo(() => {
    if (!userInfo.data) return '';

    return getConversationName(userInfo.data, conversation);
  }, [conversation]);

  // Initial message fetch
  useEffect(() => {
    fetchConversationMessages(conversation.id).then((data) => {
      setMessages(data);
    });
  }, [conversation.id]);

  // Handle incoming messages via websocket
  const onMessageReceive = (data: contracts.EmitMessage) => {
    if (data.conversationId === conversation.id) {
      setMessages((m) => {
        if (m.some((msg) => msg.id === data.id)) return m;
        return [...m, data];
      });
    }
  };

  useWebsocketListener('newMessage', onMessageReceive, isAuthenticated);

  return {
    name,
    messages,
  };
}
