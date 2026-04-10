import { fetchConversationMessages } from '#/lib/api/conversation';
import type { Conversation, Message } from '#/lib/api/conversation';
import { useUser } from '#/lib/context/UserContext';
import { useWebsocket } from '#/lib/hooks/useWebsocket';
import { useEffect, useMemo, useState } from 'react';
import type * as contracts from '@latticechat/shared';
import { getConversationName } from '#/lib/util/conversation';

export function useConversation(conversation: Conversation) {
  const { userInfo } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const { socket } = useWebsocket();
  const name = useMemo(() => {
    if (!userInfo.data) return '';

    return getConversationName(userInfo.data, conversation);
  }, [conversation]);

  function onMessageReceive(data: contracts.EmitMessage) {
    setMessages((m) => [...m, data]);
  }

  // Initial message fetch
  useEffect(() => {
    fetchConversationMessages(conversation.id).then((data) => {
      setMessages(data);
    });
  }, []);

  // Capture incoming messages via WS
  useEffect(() => {
    socket.on('message', onMessageReceive);

    return () => {
      socket.off('message', onMessageReceive);
    };
  }, []);

  return {
    name,
    messages,
  };
}
