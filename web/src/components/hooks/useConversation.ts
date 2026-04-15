import { fetchConversationMessages } from '#/lib/api/conversation';
import type { Conversation, Message } from '#/lib/api/conversation';
import { useUser } from '#/lib/context/UserContext';
import { useWebsocket } from '#/lib/hooks/useWebsocket';
import { useWebsocketListener } from '#/lib/hooks/useWebsocketListener';
import { useEffect, useMemo, useState } from 'react';
import type * as contracts from '@latticechat/shared';
import { getConversationName } from '#/lib/util/conversation';

export function useConversation(conversation: Conversation) {
  const { userInfo, refreshUser } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const { isAuthenticated } = useWebsocket();
  const name = useMemo(() => {
    if (!userInfo.data) return '';

    return getConversationName(userInfo.data, conversation);
  }, [conversation]);

  // Initial message fetch
  useEffect(() => {
    let ignore = false;
    setMessages([]);
    
    fetchConversationMessages(conversation.id).then((data) => {
      if (!ignore) {
        setMessages(data);
      }
    });

    return () => {
      ignore = true;
    };
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

  useWebsocketListener('newMessage', onMessageReceive, isAuthenticated, [conversation.id]);

  const onMemberLeft = (data: contracts.EmitMemberLeft) => {
    if (data.conversationId === conversation.id) {
      // refresh to update participants and UI
      refreshUser().catch(() => {});
    }
  };

  useWebsocketListener('memberLeft', onMemberLeft, isAuthenticated, [conversation.id]);

  const addMessage = (message: Message) => {
    setMessages((m) => {
      if (m.some((msg) => msg.id === message.id)) return m;
      return [...m, message];
    });
  };

  return {
    name,
    messages,
    addMessage,
  };
}
